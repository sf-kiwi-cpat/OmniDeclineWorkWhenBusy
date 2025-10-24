({
    doInit: function(component, event, helper) {
        console.log("AutoDeclineWorkItems component initialized");
        helper.initializeComponent(component);
    },
    
    handleOmniChannelStatusChanged: function(component, event, helper) {
        console.log("OmniChannel Status Changed event received in AutoDeclineWorkItems:", event.getParams());
        helper.handleStatusChange(component, event);
    }
})
