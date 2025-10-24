# AutoDeclineWorkItems Component

## Overview

The `AutoDeclineWorkItems` component is a background utility item that automatically declines all assigned work items when an agent's Omni-Channel status changes to busy/away states. This component runs automatically in the background without any visible UI and listens to the `lightning:omniChannelStatusChanged` event.

## Features

- **Automatic Work Item Decline**: Declines all assigned work items when status changes to busy/away
- **Custom Decline Reasons**: Set custom reasons for declining work items
- **Background Operation**: Runs automatically as a background utility item
- **Event-Driven**: Responds to Omni-Channel status change events
- **Error Handling**: Comprehensive error handling and logging

## Component Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `declineReason` | String | "Agent status changed to busy/away" | Reason for declining work items |
| `isEnabled` | Boolean | true | Whether auto-decline functionality is enabled |

## How to Deploy as Background Utility Item

### Automatic Deployment

The `AutoDeclineWorkItems` component is designed to run automatically as a background utility item. Once deployed to your org, it will:

1. **Automatically Start**: The component starts running when users log into Lightning Experience
2. **Monitor Status Changes**: Listens to `lightning:omniChannelStatusChanged` events for all users
3. **Auto-Decline Work**: Automatically declines assigned work items when agents go busy/away
4. **No Page Configuration**: No need to add to Lightning pages or configure manually

### Deployment Steps

1. **Deploy the Component**: Deploy the component bundle to your Salesforce org
2. **Add to your App in App Manager**: Go to Setup, and in App Manager add this Utility item
3. **Verify Permissions**: Ensure users have Omni-Channel permissions
4. **Test Functionality**: Test with a user who has Omni-Channel access
5. **Monitor Logs**: Check browser console for component activity logs

### Configuration

The component can be configured through its attributes, but since it's a background utility item, configuration is typically done through:

1. **Default Values**: The component uses sensible defaults
2. **Custom Attributes**: Can be set programmatically if needed
3. **Runtime Configuration**: Some settings can be adjusted at runtime

## How It Works

The component automatically:

1. **Starts on Login**: Begins monitoring when users log into Lightning Experience
2. **Listens for Events**: Responds to `lightning:omniChannelStatusChanged` events
3. **Detects Busy Status**: Uses empty `channels` array to detect busy/away status
4. **Declines Work**: Automatically declines all assigned work items
5. **Provides Feedback**: Shows toast notifications for user feedback

### Technical Details

1. **Event Listening**: The component listens to the `lightning:omniChannelStatusChanged` event
2. **Status Detection**: When the event fires, it checks if the `channels` array is empty (indicating busy/away status)
3. **Work Item Retrieval**: If busy status is detected, it calls `omniToolkit.getAgentWorks()` to get all work items
4. **Filtering**: It filters for work items where `isEngaged` is false (can be declined)
5. **Decline Process**: It calls `omniToolkit.declineAgentWork()` for each declineable work item
6. **Notifications**: Shows toast notifications for success/error states

## API Methods Used

- `omniToolkit.getAgentWorks()`: Retrieves all agent work items
- `omniToolkit.declineAgentWork({workId: workId, reason: declineReason})`: Declines a specific work item

## Event Handling

The component responds to the following events:

- `lightning:omniChannelStatusChanged`: Triggers the auto-decline process when status changes to busy/away

## Error Handling

The component includes comprehensive error handling:

- Validates Omni Toolkit API availability
- Handles individual work item decline failures gracefully
- Shows appropriate toast notifications
- Logs errors to console for debugging

## Monitoring and Debugging

### Console Logs

The component logs detailed information to the browser console:

```javascript
// Status change detection
console.log("Status changed to:", newStatus);

// Work item processing
console.log("Found " + assignedWorks.length + " assigned work items to decline");

// Individual decline results
console.log("Successfully declined work item:", workId, result);
```

### Toast Notifications

The component shows toast notifications for:

- Success: "Successfully declined X work items"
- Info: "No assigned work items found to decline"
- Error: "Error declining work items: [error message]"

## Best Practices

1. **Test Thoroughly**: Test the component in a sandbox environment first
2. **Monitor Usage**: Keep an eye on console logs and toast notifications
3. **Configure Appropriately**: Set appropriate busy statuses for your organization
4. **User Training**: Inform users about the auto-decline functionality
5. **Backup Plan**: Ensure users know how to manually accept work if needed

## Troubleshooting

### Component Not Working

1. Check that the component is enabled (`isEnabled="true"`)
2. Verify the user has Omni-Channel permissions
3. Check browser console for error messages
4. Ensure you have added the component to your Lightning App via App Manager

### Work Items Not Being Declined

1. Verify the status change is being detected
2. Check that the new status matches the configured busy statuses
3. Ensure there are actually assigned work items
4. Check for API errors in the console

### Performance Issues

1. The component processes work items sequentially with small delays
2. For large numbers of work items, consider implementing batch processing
3. Monitor API limits and governor limits

## Security Considerations

- The component only affects the current user's work items
- No cross-user data access
- Respects Omni-Channel permissions
- Uses standard Salesforce security model

## Customization

You can extend the component by:

1. Adding more sophisticated status detection logic
2. Implementing custom decline reasons based on status
3. Adding integration with external systems
4. Creating custom monitoring and reporting

## Support

For issues or questions:

1. Check the browser console for error messages
2. Review the component logs
3. Test in a sandbox environment
4. Contact your Salesforce administrator
