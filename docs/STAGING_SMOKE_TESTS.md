# Staging Environment Smoke Test Checklist

## Pre-Deployment Checklist

### Database
- [ ] Run all migrations successfully
- [ ] Verify all tables exist and have correct schema
- [ ] Check RLS policies are applied
- [ ] Verify real-time subscriptions are enabled
- [ ] Test database connection from application
- [ ] Verify backfill scripts executed successfully

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] `OPENAI_API_KEY` is set (if using AI features)
- [ ] All required env vars are present in staging

### Build & Deployment
- [ ] Application builds successfully
- [ ] No TypeScript errors
- [ ] No ESLint warnings/errors
- [ ] Bundle size is reasonable
- [ ] Source maps are generated

## Functional Tests

### 1. Calendar Tab (CRUCIAL)

#### Basic Functionality
- [ ] Navigate to Calendar tab
- [ ] Calendar displays current month correctly
- [ ] Day headers (Sun-Sat) are visible
- [ ] Can navigate to next month
- [ ] Can navigate to previous month
- [ ] "Today" button returns to current month
- [ ] Current date is highlighted

#### Event Display
- [ ] Itinerary items appear on correct dates
- [ ] Events show type icons (✈️, 🏨, 🍽️, etc.)
- [ ] Events show status badges (confirmed, booked, pending)
- [ ] Events are truncated after 2 items with "+X more"
- [ ] Event count indicator is accurate

#### Interactions
- [ ] Clicking a date shows events in sidebar
- [ ] Sidebar displays correct date
- [ ] Sidebar lists all events for selected date
- [ ] Events in sidebar are sorted by time
- [ ] Clicking an event opens detail drawer
- [ ] Detail drawer shows complete event information

#### Responsive Design
- [ ] Calendar works on mobile (375px width)
- [ ] Calendar works on tablet (768px width)
- [ ] Calendar works on desktop (1920px width)

### 2. Notes Tab (VERY IMPORTANT)

#### Basic Functionality
- [ ] Navigate to Notes tab
- [ ] Notes sidebar is visible
- [ ] Default notes are displayed (Packing List, Food Research, Travel Insurance)
- [ ] Search box is functional
- [ ] "New" button is clickable

#### Create Operations
- [ ] Click "New" opens dialog
- [ ] Can enter note title
- [ ] Can create new note
- [ ] New note appears in sidebar
- [ ] Note enters edit mode after creation
- [ ] Can save new note content

#### Read Operations
- [ ] Click on note selects it
- [ ] Note content displays in editor area
- [ ] Markdown is rendered correctly
  - [ ] Headers (# H1, ## H2, ### H3)
  - [ ] Lists (bullets)
  - [ ] Line breaks
- [ ] Last edited info is shown
- [ ] Last edited date is formatted correctly

#### Update Operations
- [ ] Click edit button enters edit mode
- [ ] Can modify note title
- [ ] Can modify note content
- [ ] Save button commits changes
- [ ] Cancel button reverts changes
- [ ] Changes persist after reload

#### Delete Operations
- [ ] Click delete button
- [ ] Confirmation dialog appears
- [ ] Confirm deletes the note
- [ ] Cancel keeps the note
- [ ] Note removed from sidebar after deletion

#### Search & Filter
- [ ] Search finds notes by title
- [ ] Search finds notes by content
- [ ] Search shows "No notes found" when empty
- [ ] Clear search button works
- [ ] Filtered results update immediately

#### Favorites
- [ ] Star/favorite icon is visible
- [ ] Click star toggles favorite status
- [ ] Starred notes show filled star icon
- [ ] Favorite status persists after reload

#### Collaboration (Multi-User)
- [ ] Open app in two browsers (User A & B)
- [ ] User A creates note, User B sees it appear
- [ ] User A edits note, User B sees updates
- [ ] User A deletes note, User B sees removal
- [ ] Last edited attribution shows correct user

### 3. Budget Tab

#### Overview Display
- [ ] Navigate to Budget tab
- [ ] Total spent amount is displayed
- [ ] Individual spending shows for each person
- [ ] Expenses table is visible with data
- [ ] Table headers are correct

#### Create Expense
- [ ] Click "Add Expense" button
- [ ] Dialog opens
- [ ] Can select category
- [ ] Can enter description
- [ ] Can enter amount
- [ ] Can select who paid
- [ ] Can select date
- [ ] Can select payment method
- [ ] Submit button is disabled without required fields
- [ ] Submit creates expense
- [ ] New expense appears in table

#### Expense Display
- [ ] Expenses sorted by date (newest first)
- [ ] Category badges display correctly
- [ ] Amounts formatted with currency symbol
- [ ] Paid by badges show correct person
- [ ] All expense details visible

#### Settlements Calculation
- [ ] Settlements section is visible
- [ ] Settlement amount is calculated correctly
- [ ] Settlement shows who owes whom
- [ ] Adding expense updates settlement
- [ ] Deleting expense updates settlement
- [ ] Settlement math is accurate (total/2 - paid)

#### Delete Expense
- [ ] Click delete button on expense
- [ ] Expense is removed immediately
- [ ] Totals update after deletion
- [ ] Settlement recalculates

#### Split Equally Toggle
- [ ] Split equally toggle is visible
- [ ] Toggle can be clicked
- [ ] State persists during session

#### Responsive Design
- [ ] Budget view works on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Summary cards stack on mobile

### 4. Files Tab

#### Basic Display
- [ ] Navigate to Files tab
- [ ] Files grid is visible
- [ ] Default files are displayed
- [ ] File names are visible
- [ ] File sizes are formatted (KB, MB)
- [ ] File type badges show (PDF, IMG, DOC)

#### Category Filters
- [ ] "All Files" button shows all
- [ ] "Images" button filters to images only
- [ ] "Documents" button filters to documents only
- [ ] "Other" button filters to other types
- [ ] File counts are accurate in buttons

#### Search
- [ ] Search box is functional
- [ ] Search finds files by name
- [ ] Search shows "No files found" when empty
- [ ] Clear search button works

#### Upload Files
- [ ] Click "Upload Files" button
- [ ] File input accepts selection
- [ ] Upload dialog shows selected files
- [ ] Can upload single file
- [ ] Can upload multiple files
- [ ] Upload progress/feedback is shown
- [ ] Uploaded files appear in grid
- [ ] Cancel upload button works

#### File Actions
- [ ] Hover over file shows actions menu
- [ ] Click actions button shows dropdown
- [ ] "Download" option is present
- [ ] "Delete" option is present

#### Download Files
- [ ] Click download triggers download
- [ ] Correct file is downloaded
- [ ] Filename is preserved

#### Delete Files
- [ ] Click delete shows confirmation
- [ ] Confirm deletes the file
- [ ] Cancel keeps the file
- [ ] File removed from grid after deletion

#### File Types
- [ ] PDF files show PDF icon
- [ ] Images show thumbnail preview
- [ ] Documents show DOC icon
- [ ] Unknown types show generic icon

#### Empty State
- [ ] Delete all files
- [ ] Empty state message appears
- [ ] Upload button is prominent

#### Responsive Design
- [ ] Files grid adapts to screen size
- [ ] Grid shows 2 columns on mobile
- [ ] Grid shows 4-5 columns on desktop

### 5. Settings Tab

#### Display
- [ ] Navigate to Settings tab
- [ ] All setting sections are visible
- [ ] Regional Settings section
- [ ] Collaborators section
- [ ] Notifications section
- [ ] Preferences section

#### Regional Settings
- [ ] Timezone dropdown works
- [ ] Currency dropdown works
- [ ] Date format dropdown works
- [ ] Time format dropdown works
- [ ] Selected values are displayed

#### Collaborators
- [ ] Existing collaborators listed
- [ ] Names and emails displayed
- [ ] Roles shown (owner, editor, viewer)
- [ ] Avatar initials displayed
- [ ] Can add new collaborator email
- [ ] "Add" button adds collaborator
- [ ] Can remove non-owner collaborators
- [ ] Default assignee toggle works

#### Notifications
- [ ] Master notification toggle works
- [ ] Itinerary changes toggle works
- [ ] Budget updates toggle works
- [ ] New messages toggle works
- [ ] Toggles disabled when master is off

#### Preferences
- [ ] Auto-save toggle works
- [ ] Theme dropdown works (Light/Dark/System)

#### Save Settings
- [ ] "Save Changes" button visible
- [ ] Click save persists settings
- [ ] Success message shown
- [ ] Settings persist after reload

#### Responsive Design
- [ ] Settings work on mobile
- [ ] Form elements stack properly
- [ ] Buttons are accessible

### 6. Navigation & General

#### Tab Navigation
- [ ] All tabs are visible
- [ ] Overview tab works
- [ ] Itinerary tab works
- [ ] Map tab works
- [ ] Calendar tab works
- [ ] Notes tab works
- [ ] Budget tab works
- [ ] Files tab works
- [ ] Settings tab works
- [ ] Active tab is highlighted
- [ ] Tab state persists on reload

#### Header
- [ ] Trip name is displayed
- [ ] Trip dates are shown
- [ ] Share button is visible
- [ ] View on Map button works

#### Sidebar
- [ ] Sidebar is visible
- [ ] Home link works
- [ ] Japan Trip link works
- [ ] Favorites section visible
- [ ] Pages section visible
- [ ] Settings button works

#### Right Panel
- [ ] AI Assistant panel toggles
- [ ] Activity Feed displays
- [ ] Recent activities shown

#### Theme
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Theme toggle in header works
- [ ] Theme persists after reload

#### Loading States
- [ ] Tabs show loading states
- [ ] Skeletons/spinners display
- [ ] No flash of unstyled content

#### Error States
- [ ] Network errors show message
- [ ] 404 pages have fallback
- [ ] Error boundaries catch crashes

## Performance Tests

### Page Load
- [ ] Initial page load < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No layout shift on load

### Tab Switching
- [ ] Tab switches are instant
- [ ] No lag when navigating
- [ ] Animations are smooth

### Data Operations
- [ ] Creating items is < 1 second
- [ ] Updating items is < 1 second
- [ ] Deleting items is < 1 second
- [ ] Search results appear instantly

### Real-time Updates
- [ ] Updates appear within 2 seconds
- [ ] No duplicate updates
- [ ] UI doesn't flicker

## Security Tests

### Authentication
- [ ] Unauthenticated users redirected (if applicable)
- [ ] Auth tokens are set correctly
- [ ] Logout clears session

### Authorization (RBAC)
- [ ] Owners can access all features
- [ ] Editors can create/edit content
- [ ] Viewers can only view content
- [ ] Unauthorized actions are blocked

### Data Protection
- [ ] SQL injection is prevented
- [ ] XSS attacks are prevented
- [ ] CSRF tokens are used
- [ ] Sensitive data is not logged

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Firefox

## Accessibility

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Escape closes dialogs
- [ ] Enter submits forms

### Screen Readers
- [ ] ARIA labels are present
- [ ] Landmarks are defined
- [ ] Alt text on images
- [ ] Form labels are associated

### Color & Contrast
- [ ] Text meets WCAG AA standards
- [ ] Interactive elements have sufficient contrast
- [ ] Color is not the only indicator

## Monitoring & Alerts

### Error Tracking
- [ ] Errors are logged to monitoring service
- [ ] Source maps uploaded for debugging
- [ ] Error notifications are sent

### Performance Monitoring
- [ ] Page load metrics tracked
- [ ] API response times tracked
- [ ] Database query times tracked

### Analytics
- [ ] Page views tracked
- [ ] User actions tracked
- [ ] Conversion funnels set up

## Post-Deployment

### Health Checks
- [ ] Health endpoint responds
- [ ] Database is reachable
- [ ] External APIs respond
- [ ] CDN is serving assets

### Smoke Test (Automated)
- [ ] Run E2E test suite
- [ ] All critical paths pass
- [ ] No console errors

### User Acceptance
- [ ] Stakeholders review
- [ ] QA team approves
- [ ] Product owner signs off

## Rollback Plan

If critical issues are found:
1. [ ] Document the issue
2. [ ] Assess severity (P0, P1, P2)
3. [ ] Decide: hotfix or rollback
4. [ ] Execute rollback if needed
5. [ ] Notify stakeholders
6. [ ] Schedule fix deployment

## Sign-Off

**Date:** _____________

**Tested By:** _____________

**Environment:** staging.stellar-spicule.com

**Version:** v1.0.0

**Status:** ☐ PASS ☐ FAIL

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
