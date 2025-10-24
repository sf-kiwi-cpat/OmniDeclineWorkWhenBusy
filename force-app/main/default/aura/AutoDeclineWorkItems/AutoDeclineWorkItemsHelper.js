({
    initializeComponent: function(component) {
        console.log("AutoDeclineWorkItems helper initialized");
        
        // Set initial state
        component.set("v.isProcessing", false);
        component.set("v.declinedCount", 0);
        
        // Check if component is enabled
        var isEnabled = component.get("v.isEnabled");
        if (!isEnabled) {
            console.log("AutoDeclineWorkItems is disabled");
            return;
        }
        
        console.log("AutoDeclineWorkItems is ready to monitor status changes");
    },
    
    handleStatusChange: function(component, event) {
        var self = this;
        if (!event || !event.getParams()) {
            console.log("No event received");
            return;
        }
        var eventParams = event.getParams();
        var newStatus = eventParams.statusName || eventParams.status || "Unknown";
        var channels = eventParams.channels || [];
        var isEnabled = component.get("v.isEnabled");
        
        console.log("Status changed to:", newStatus);
        console.log("Channels:", channels);
        
        // Check if component is enabled
        if (!isEnabled) {
            console.log("AutoDeclineWorkItems is disabled, ignoring status change");
            return;
        }
        
        // Check if status change should trigger auto-decline
        // Empty channels array indicates busy/away status
        var shouldDecline = this.isBusyStatus(channels);
        
        if (shouldDecline) {
            console.log("Status change to busy/away detected (empty channels), starting auto-decline process");
            this.processAutoDecline(component);
        } else {
            console.log("Status change does not require auto-decline - channels available:", channels);
        }
    },
    
    isBusyStatus: function(channels) {
        // Empty channels array indicates busy/away status
        // When channels is empty, the agent is not available for new work
        return !channels || channels.length === 0;
    },
    
    processAutoDecline: function(component) {
        var self = this;
        var omniToolkit = component.find("omniToolkit");
        var notifLib = component.find("notifLib");
        
        if (!this.validateOmniToolkit(component, omniToolkit, notifLib)) {
            return;
        }
        
        component.set("v.isProcessing", true);
        console.log("Starting auto-decline process...");
        
        // Get all agent works
        this.getAgentWorks(component)
            .then(function(agentWorks) {
                console.log("Retrieved agent works:", agentWorks);
                var works = [];
                var declineableWorks = [];

                // Parse the works array from the result of the getAgentWorks() method
                if (agentWorks.works) {
                    console.log("agentWorks.works is an array");
                    works = JSON.parse(agentWorks.works);
                } else {
                    console.log("No agent works found to decline");
                    self.showToast(notifLib, "Auto-Decline", "No work items found to decline", "info");
                    return;
                }
                
                for (var i = 0; i < works.length; i++) {
                    var work = works[i];
                    if (work && work.isEngaged === false) {
                        declineableWorks.push(work);
                    }
                }
                
                if (declineableWorks.length === 0) {
                    console.log("No declineable work items found");
                    self.showToast(notifLib, "Auto-Decline", "No declineable work items found", "info");
                    return;
                }
                
                console.log("Found " + declineableWorks.length + " declineable work items");
                
                // Decline each declineable work item
                return self.declineAllWorkItems(component, declineableWorks);
            })
            .then(function(declinedCount) {
                console.log("Auto-decline process completed. Declined " + declinedCount + " work items");
                component.set("v.declinedCount", declinedCount);
                component.set("v.lastProcessedTime", new Date());
                
                if (declinedCount > 0) {
                    var showSuccessToast = component.get("v.showSuccessToast");
                    if (showSuccessToast) {
                        self.showToast(notifLib, "Auto-Decline", "Successfully declined " + declinedCount + " work items", "success");
                    }
                }
            })
            .catch(function(error) {
                console.error("Error in auto-decline process:", error);
                self.showToast(notifLib, "Auto-Decline Error", "Error declining work items: " + (error.message || "Unknown error"), "error");
            })
            .finally(function() {
                component.set("v.isProcessing", false);
            });
    },
    
    getAgentWorks: function(component) {
        var omniToolkit = component.find("omniToolkit");
        
        return new Promise(function(resolve, reject) {
            omniToolkit.getAgentWorks()
                .then(function(result) {
                    console.log("getAgentWorks result:", result);
                    resolve(result);
                })
                .catch(function(error) {
                    console.error("Error getting agent works:", error);
                    reject(error);
                });
        });
    },
    
    declineAllWorkItems: function(component, workItems) {
        var self = this;
        var omniToolkit = component.find("omniToolkit");
        var declineReason = component.get("v.declineReason");
        var declinedCount = 0;
        
        console.log("Starting to decline " + workItems.length + " declineable work items");
        
        // Process each work item sequentially to avoid overwhelming the API
        return new Promise(function(resolve, reject) {
            var processNext = function(index) {
                if (index >= workItems.length) {
                    console.log("All work items processed. Declined: " + declinedCount);
                    resolve(declinedCount);
                    return;
                }
                
                var workItem = workItems[index];
                console.log("Declining work item " + (index + 1) + " of " + workItems.length + ":", workItem);
                
                // Convert to 15-character ID if needed
                var workId = workItem.workId;
                if (workId && workId.length > 15) {
                    workId = workId.substring(0, 15);
                }
                
                if (!workId) {
                    console.log("No work ID found for work item:", workItem);
                    processNext(index + 1);
                    return;
                }
                
                // Decline the work item
                omniToolkit.declineAgentWork({
                    workId: workId,
                    reason: declineReason
                })
                .then(function(result) {
                    console.log("Successfully declined work item:", workId, result);
                    declinedCount++;
                    // Add a small delay between declines to be respectful to the API
                    setTimeout(function() {
                        processNext(index + 1);
                    }, 100);
                })
                .catch(function(error) {
                    console.error("Error declining work item " + workId + ":", error);
                    // Continue with next item even if this one fails
                    setTimeout(function() {
                        processNext(index + 1);
                    }, 100);
                });
            };
            
            // Start processing from the first item
            processNext(0);
        });
    },
    
    validateOmniToolkit: function(component, omniToolkit, notifLib) {
        if (!omniToolkit) {
            console.error("Omni Toolkit not found");
            this.showToast(notifLib, "Error", "Unable to access Omni Toolkit API", "error");
            return false;
        }
        return true;
    },
    
    showToast: function(notifLib, title, message, type) {
        if (notifLib) {
            notifLib.showToast({
                "title": title,
                "message": message,
                "variant": type
            });
        } else {
            // Fallback to console if notifications library is not available
            console.log(type.toUpperCase() + " - " + title + ": " + message);
        }
    }
})
