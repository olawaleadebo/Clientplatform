# 📞 Call Completion & Recycling System

## Overview
This document explains how the BTMTravel CRM handles daily call assignments, completions, and automatic recycling of uncompleted calls.

---

## 🎯 How It Works

### 1. **Daily Number Assignment**
- **Managers/Admins** assign numbers to agents daily through the **Database Manager**
- Numbers are assigned from the **Clients and Customers Database**
- Each assignment is tracked with:
  - Agent username and name
  - Assignment date and time
  - Type (Client CRM or Customer Service)
  - Status (assigned, claimed, completed)

### 2. **Agent Call Workflow**

#### For Client CRM:
```
1. Agent opens "Client CRM" tab
2. Views assigned contacts for the day
3. Claims a number (locks it for 30 minutes)
4. Makes the call using 3CX integration
5. Marks call as completed with outcome (Success/No Answer/Callback/Not Interested)
6. System tracks completion automatically
```

#### For Customer Service:
```
1. Agent opens "Customer Service" tab
2. Views assigned customers
3. Clicks "View Details" to see customer info
4. Makes call and assists customer
5. MUST CLICK "Complete Interaction" button to mark as done
6. Fills in outcome notes before completing
```

**IMPORTANT:** Just closing the customer details dialog does NOT mark it as completed. You must explicitly click the "Complete Interaction" button.

---

## 3. **What Happens to Uncompleted Calls?**

### Automatic Recycling (Midnight):
- At **12:00 AM daily**, the system automatically:
  1. Identifies all uncompleted calls from the previous day
  2. Recycles them back to the main database
  3. Makes them available for reassignment
  4. Archives completed calls for record-keeping

### Manual Recycling (Manager/Admin):
- Managers can manually trigger recycling anytime via:
  - **Call Completion Tracker** component
  - Individual agent recycling
  - Bulk recycling of all uncompleted calls

---

## 4. **Where Completed Numbers Go**

### Completion Flow:
```
Assigned Number 
    ↓
Agent Calls & Completes
    ↓
Marked as COMPLETED
    ↓
Archived to Completed Calls Archive
    ↓
Available in Archive Manager for review/export
```

### Archive Structure:
- **Type**: Client or Customer
- **Agent**: Who handled the call
- **Date**: When it was completed
- **Outcome**: Success, Callback, etc.
- **Notes**: Agent's interaction notes
- **Original Data**: Full contact/customer information

---

## 5. **Recycling Logic**

### What Gets Recycled:
✅ Numbers assigned but never claimed
✅ Numbers claimed but not called
✅ Numbers called but not marked complete
✅ Expired claims (> 30 minutes)

### What Stays Completed:
❌ Calls marked as completed (any outcome)
❌ Calls with interaction logs
❌ Calls archived by agents

### Recycling Process:
```javascript
1. System identifies assigned numbers for the day
2. Filters out completed calls
3. Remaining = Uncompleted
4. Removes assignment data
5. Returns numbers to main database pool
6. Numbers become available for reassignment
```

---

## 6. **Tracking & Monitoring**

### Manager Dashboard shows:
- **Total Assigned Today**: All numbers pushed to agents
- **Completed**: Successfully finished calls
- **Uncompleted**: Not yet done
- **Completion Rate**: % of assigned calls completed

### Per-Agent Tracking:
- Individual completion rates
- Time of last call
- Total calls today
- Uncompleted count

---

## 7. **End of Day Process**

### What Happens Automatically:
```
11:59 PM
  ↓
System scans all assignments
  ↓
Identifies completed vs uncompleted
  ↓
12:00 AM (Midnight)
  ↓
Uncompleted → Recycled to database
  ↓
Completed → Archived for records
  ↓
Agent call counts reset
  ↓
Ready for next day assignments
```

---

## 8. **Using the Call Completion Tracker**

### Location:
- **Manager Portal** → **Call Completion Tracker** tab
- **Admin Panel** → **Call Progress** section

### Features:
1. **Overall Stats Card**
   - Total assigned
   - Completed
   - Uncompleted
   - Completion rate

2. **Agent Details**
   - Individual progress
   - Completion percentage
   - Recycle button per agent

3. **Manual Recycle**
   - "Recycle Now" button for all uncompleted
   - "Recycle X Numbers" for specific agent

### When to Use Manual Recycle:
- Agent went home sick (recycle their numbers)
- Agent completed their list (free up for others)
- Emergency reassignment needed
- End of shift cleanup

---

## 9. **Best Practices**

### For Agents:
✅ Always claim numbers before calling
✅ Complete interactions properly (click Complete button)
✅ Add detailed notes for callbacks
✅ Don't hold numbers too long (30 min limit)

### For Managers:
✅ Assign appropriate daily targets
✅ Monitor completion rates throughout the day
✅ Recycle uncompleted calls from absent agents
✅ Review archived calls for quality assurance

### For Admins:
✅ Ensure enough numbers in database
✅ Monitor system health
✅ Review recycling logs
✅ Export completed calls for reporting

---

## 10. **Technical Details**

### Database Collections:
- `assignments` - Active daily assignments
- `completedCalls` - Archived completed interactions
- `clients` - Main prospective client pool
- `customers` - Main existing customer pool

### API Endpoints:
- `GET /call-progress` - Get current progress
- `POST /call-progress/recycle` - Recycle all uncompleted
- `POST /call-progress/recycle-agent` - Recycle for specific agent
- `POST /call-progress/archive-completed` - Archive completed calls

### Key States:
- **assigned** - Number given to agent
- **claimed** - Agent locked the number
- **completed** - Call finished and marked complete
- **recycled** - Returned to database pool
- **archived** - Stored in completed archive

---

## 11. **Troubleshooting**

### Issue: "My calls show as uncompleted even though I called"
**Solution**: Make sure you clicked "Complete Interaction" button in Customer Service or marked the call outcome in Client CRM.

### Issue: "Numbers not showing up for agent"
**Solution**: Check if numbers were properly assigned in Database Manager. Verify agent username matches.

### Issue: "Recycling not working"
**Solution**: Ensure you have Manager/Admin permissions. Check backend server is running.

### Issue: "Completion rate seems wrong"
**Solution**: Refresh the page. Wait for auto-refresh (30 seconds). Check if backend sync is working.

---

## 12. **FAQ**

**Q: What happens if I close the customer details without completing?**
A: Nothing. The call remains uncompleted and will be recycled at midnight. You must click "Complete Interaction" to mark it done.

**Q: Can I get a number back after it's recycled?**
A: Yes, if it's reassigned to you. Recycled numbers go back to the main pool and can be assigned again.

**Q: Where can I see my completed calls?**
A: Archive Manager → Filter by your username → View completed interactions with dates and notes.

**Q: Can agents recycle their own numbers?**
A: No, only Managers and Admins can recycle to prevent accidental data loss.

**Q: What if I need to follow up with a customer tomorrow?**
A: Mark it as completed with "Follow-up" outcome and add notes. Manager can reassign it to you tomorrow.

---

## 13. **Component Integration**

### To add Call Completion Tracker to Manager Portal:

```typescript
import { CallCompletionTracker } from "./components/CallCompletionTracker";

// In ManagerPortal.tsx tabs:
<TabsContent value="call-tracker">
  <CallCompletionTracker />
</TabsContent>
```

### To add to Admin Panel:

```typescript
// In AdminSettings.tsx:
<Collapsible>
  <CollapsibleTrigger>
    <h3>Call Progress & Recycling</h3>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <CallCompletionTracker />
  </CollapsibleContent>
</Collapsible>
```

---

## Summary

The Call Completion & Recycling System ensures:
- ✅ No numbers are lost or forgotten
- ✅ Uncompleted calls are automatically recycled
- ✅ Completed calls are properly archived
- ✅ Managers have full visibility
- ✅ System resets daily for fresh starts
- ✅ Historical data is preserved

**Remember**: The system works automatically, but agents MUST manually mark calls as completed!
