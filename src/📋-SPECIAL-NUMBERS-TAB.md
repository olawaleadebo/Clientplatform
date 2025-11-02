# Special Numbers Tab - Agent Portal

## Overview

A dedicated tab in the Agent portal for managing and calling special numbers. Special numbers are high-priority contacts assigned by managers for specific purposes (VIP follow-ups, promo campaigns, urgent matters, etc.).

---

## Location

**Agent Portal** → **Special Numbers** tab (4th tab)

The tab appears alongside:
1. Prospective Client (CRM)
2. Special Numbers ⭐ **← NEW**
3. Promo Sales
4. Customer Service

---

## Features

### 📊 Dashboard Overview
- **Pending Count**: Number of special numbers awaiting calls
- **Completed Count**: Number of special numbers already called
- **Visual Design**: Purple/pink gradient theme to distinguish from regular clients

### 🔍 Search & Filter
- Search by phone number
- Search by purpose
- Search by notes
- Real-time filtering as you type

### 📋 Assignment List
Each special number shows:
- **Phone Number**: With quick-copy functionality
- **Purpose Badge**: Color-coded purpose tag (e.g., "VIP Follow-up", "Promo Campaign")
- **Notes**: Important context from the manager
- **Assigned Date**: When the number was assigned
- **Call Action**: "Call Now" button with 3CX integration

### 📞 Call Workflow

1. **Click "Call Now"**
   - Opens call dialog
   - Initiates 3CX call automatically
   - Shows assignment details

2. **During Call**
   - View purpose and notes
   - Add call notes in real-time

3. **Complete Call**
   - Mark as completed
   - Number is automatically archived
   - Removed from special database (preventing reassignment)

---

## For Agents

### How to Use

1. **Login** to the CRM as an agent
2. **Navigate** to the "Special Numbers" tab
3. **Review** your assigned special numbers
4. **Call** by clicking "Call Now" on any number
5. **Complete** the call with optional notes
6. **Done!** Number is marked complete and archived

### Best Practices

- ✅ **Check daily** for new special assignments
- ✅ **Read the purpose** before calling to understand context
- ✅ **Review notes** from your manager for important details
- ✅ **Add call notes** to document outcomes
- ✅ **Complete immediately** after finishing the call

### What Makes a Number "Special"?

Special numbers are different from regular prospects:
- **Higher priority** - Requires immediate attention
- **Specific purpose** - Clear objective for the call
- **Manager notes** - Additional context or instructions
- **One-time assignment** - Once called, it's archived (not reassigned)
- **Separate tracking** - Not mixed with regular client database

---

## For Managers

### How to Assign Special Numbers

1. **Open Manager Portal**
2. **Navigate** to "Special Database" section
3. **Import or Add** special numbers with CSV or manual entry
4. **Select numbers** to assign
5. **Choose agent** from dropdown
6. **Assign** - Numbers appear instantly in agent's Special Numbers tab

### CSV Import Format

```csv
phoneNumber,purpose,notes
+234 803 123 4567,VIP Follow-up,"Customer requested callback about corporate package"
+234 805 987 6543,Promo Campaign,"Interest in Black Friday deals - high conversion potential"
+234 701 234 5678,Urgent Matter,"Complaint escalation - handle with priority"
```

### Tracking

- View assignment status in Special Database Manager
- Monitor completion rates per agent
- Access archived special numbers for reference
- Recycle numbers if needed (returns to available pool)

---

## Technical Details

### Components

**Primary Component**: `/components/SpecialNumbers.tsx`
- Handles special number display
- Manages call workflow
- Integrates with 3CX for click-to-call
- Archives completed calls

**Updated Components**:
- `/App.tsx` - Added 4th tab for agents
- `/components/ClientCRM.tsx` - Filters out special assignments (prevents duplication)

### Backend Integration

**Endpoints Used**:
- `GET /assignments?agentId={id}` - Fetch special assignments
- `POST /special-database/complete-call` - Mark call complete and archive

**Data Flow**:
1. Manager assigns special numbers → Creates assignment in `number_assignments` collection
2. Agent opens Special Numbers tab → Fetches assignments filtered by `type: 'special'`
3. Agent calls and completes → Archives to `special_database_archive`, marks assignment as called
4. Number disappears from agent's view (moved to archive)

### Database Collections

**Collections Used**:
- `number_assignments` - Active special assignments
- `special_database` - Available special numbers
- `special_database_archive` - Completed/archived special numbers

### Assignment Structure

```typescript
{
  id: string;
  agentId: string;
  phoneNumber: string;
  purpose: string;
  notes?: string;
  type: 'special';  // Distinguishes from regular assignments
  assignedAt: string;
  called: boolean;
  completedAt?: string;
  numberData: {
    phoneNumber: string;
    name: string;      // Purpose used as name
    purpose: string;
    notes?: string;
  }
}
```

---

## User Interface

### Visual Design

- **Color Theme**: Purple/pink gradient (differs from violet/blue of regular clients)
- **Icons**: Star icon (⭐) for special designation
- **Badges**: Outlined purple badges for purposes
- **Cards**: Glassmorphism with purple accents

### Responsive Design

- **Desktop**: Full table view with all details
- **Tablet**: Condensed columns, shorter labels
- **Mobile**: Stacked card layout (auto-adapts via Tailwind)

---

## Workflow Comparison

### Regular Clients (Prospective Client Tab)
1. Assigned from client/customer database
2. Multiple call attempts possible
3. Status tracking (pending → in progress → completed)
4. Can be reassigned or recycled
5. Mixed with customer database

### Special Numbers (Special Numbers Tab)
1. Assigned from special database
2. One-time call expected
3. Simple workflow (pending → completed)
4. Archived after completion (not reassigned)
5. Separate dedicated interface

---

## Benefits

### For Agents
✅ **Clear Separation** - Special numbers don't clutter regular client list  
✅ **Focus** - Dedicated space for high-priority calls  
✅ **Context** - Purpose and notes visible before calling  
✅ **Efficiency** - Quick call completion workflow  
✅ **Motivation** - Visual progress tracking (pending vs completed)

### For Managers
✅ **Targeted Assignment** - Assign specific numbers for specific purposes  
✅ **Tracking** - Monitor special campaign completion  
✅ **Flexibility** - Different workflow from regular client calls  
✅ **Archive** - Historical record of special assignments  
✅ **No Duplication** - Numbers won't be reassigned once completed

### For Business
✅ **Priority Handling** - VIP/urgent numbers get dedicated attention  
✅ **Campaign Management** - Track promo-specific calling  
✅ **Quality Control** - Agents understand context before calling  
✅ **Reporting** - Separate metrics for special vs regular calls  

---

## Migration Notes

**Date Added**: November 2, 2025  
**Version**: v2.0 - Special Numbers Tab  
**Breaking Changes**: None - additive feature  
**Backward Compatibility**: ✅ Yes - existing special assignments work immediately  

### For Existing Deployments

If you already have special assignments in your database:
1. The new tab will appear automatically for agents
2. Existing special assignments will show in the new tab
3. ClientCRM tab will stop showing special assignments (filtered out)
4. No data migration required - works with existing data structure

---

## Future Enhancements

Potential improvements for future versions:

- [ ] **Bulk Complete** - Mark multiple calls complete at once
- [ ] **Special Number Analytics** - Completion rates by purpose type
- [ ] **Priority Levels** - Urgent, High, Normal priority badges
- [ ] **Due Dates** - Optional deadlines for special numbers
- [ ] **Call Scheduling** - Schedule specific call times
- [ ] **Follow-up Reminders** - Automatic reminders for pending specials
- [ ] **Purpose Templates** - Pre-defined purpose categories
- [ ] **Export Reports** - Download special call completion reports

---

## Support & Troubleshooting

### Common Issues

**Q: Special numbers not showing in my tab?**  
A: Check that they're assigned to you specifically. Ask your manager to verify the assignment.

**Q: Can I uncomplete a call?**  
A: No - once marked complete, it's archived. Contact your manager if you need to re-engage.

**Q: What happens if I close the dialog without completing?**  
A: The number remains in your pending list. You can call again later.

**Q: Can I see completed special numbers?**  
A: Managers can see them in the archive. Agents only see pending numbers.

### Error Messages

- **"Failed to load special numbers"** - Backend connection issue. Refresh page.
- **"Failed to complete call"** - Check backend connection and try again.
- **"Assignment not found"** - Number may have been unassigned by manager.

---

## Related Documentation

- [Special Database System](./SPECIAL-DATABASE-SYSTEM.md)
- [Special Database CSV Import](./SPECIAL-DATABASE-CSV-IMPORT.md)
- [Special Database Fix](./🔧-SPECIAL-DATABASE-FIX.md)
- [Single Database System](./SINGLE-DATABASE-SYSTEM.md)

---

**Last Updated**: November 2, 2025  
**Status**: ✅ Active  
**Maintained By**: BTMTravel Development Team
