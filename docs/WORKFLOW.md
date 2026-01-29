# Editorial Workflow Documentation

## Overview

This document outlines the editorial workflow for Inshort, from ideation to publication.

---

## Content Creation Process

### Step 1: Planning & Ideation

- **Topic Selection**: Choose topics aligned with Inshort's mission
- **Research**: Gather information, verify sources, identify key facts
- **Angle**: Determine unique perspective or new information
- **Timeline**: Estimate writing time and deadline

### Step 2: Writing

1. **Draft Creation**:
   - Use appropriate template from [CONTENT_TEMPLATES.md](CONTENT_TEMPLATES.md)
   - Follow [EDITORIAL_STYLE_GUIDE.md](EDITORIAL_STYLE_GUIDE.md)
   - Write in The Editor (`/admin/editor`)

2. **Content Requirements**:
   - Headline (50-70 characters)
   - Excerpt (150-300 characters)
   - Featured image (16:9 aspect ratio)
   - Full article content (minimum 300 words)
   - Appropriate category

3. **Metadata**:
   - Slug (auto-generated, can be edited)
   - Category selection
   - Featured image upload

### Step 3: Review & Fact-Checking

**Self-Review Checklist:**
- [ ] All facts verified with sources
- [ ] Quotes are accurate and attributed
- [ ] No spelling or grammatical errors
- [ ] Headline accurately reflects content
- [ ] Images are relevant and properly credited
- [ ] Links work and point to reliable sources
- [ ] Follows style guide

**Fact-Checking Protocol:**
1. Verify all numbers, dates, and statistics
2. Confirm all names and titles are spelled correctly
3. Check quotes against original sources
4. Verify links work and point to correct pages
5. Confirm image permissions and credits

### Step 4: Save as Draft

- Click "Save Draft" in The Editor
- Post will be saved with status "draft"
- Can be edited later from The Desk

### Step 5: Publication

**For Standard Articles:**
1. Complete all review checklists
2. Click "Publish" button
3. Article immediately goes live with status "published"
4. View counter starts tracking

**For Breaking News:**
1. Verify all critical facts
2. Publish article
3. Go to Traffic Control (`/admin/traffic`)
4. Enable breaking news banner
5. Enter banner text
6. Save configuration

---

## Content Management

### The Desk (`/admin/desk`)

**Purpose**: Overview of all articles

**Features:**
- View all posts (drafts, published, archived)
- See views, status, creation date
- Edit posts via "Edit Post" action
- Bulk operations (publish, archive, delete)

**Workflow:**
1. Review draft articles
2. Edit as needed
3. Publish when ready
4. Monitor view counts
5. Archive old content

### The Editor (`/admin/editor`)

**Purpose**: Create and edit articles

**Features:**
- Rich text editor (Tiptap)
- Image upload (drag & drop)
- Auto-slug generation
- Save Draft / Publish options
- Validation before saving

**Editing Existing Posts:**
- Go to The Desk
- Click "Edit Post" from actions menu
- Make changes
- Save Draft or Publish

---

## Site Configuration

### Traffic Control (`/admin/traffic`)

**Purpose**: Manage homepage appearance without code changes

**Features:**

1. **Hero Article**
   - Select featured article from dropdown
   - Changes homepage hero immediately
   - Update anytime

2. **Breaking News Banner**
   - Toggle on/off
   - Edit banner text
   - Visible immediately when enabled

3. **Trending Posts (Sidebar)**
   - Select up to 5 posts to feature
   - Search posts by title
   - Update sidebar instantly

**Best Practices:**
- Update hero article daily or weekly
- Use breaking news banner sparingly
- Refresh trending posts regularly
- Coordinate with editorial calendar

---

## Editorial Calendar (Future Enhancement)

### Planning Process

1. **Weekly Planning Meeting**
   - Review upcoming events
   - Assign articles
   - Set deadlines

2. **Content Calendar**
   - Plan 1-2 weeks ahead
   - Balance categories
   - Schedule breaking news coverage

3. **Deadline Management**
   - Set clear deadlines
   - Track progress
   - Adjust as needed

---

## Quality Control

### Pre-Publication Review

**Editor Checklist:**
- [ ] Article follows style guide
- [ ] All facts verified
- [ ] Images are appropriate
- [ ] No grammatical errors
- [ ] Headline is accurate
- [ ] Category is correct
- [ ] Slug is unique and URL-friendly

### Post-Publication

**Monitoring:**
- Check view counts in Analytics
- Monitor for errors or issues
- Update if corrections needed
- Respond to reader feedback

---

## Breaking News Protocol

### When to Break News

1. **Criteria:**
   - Immediate impact on many people
   - Time-sensitive information
   - Major significance
   - Public safety concerns

2. **Process:**
   - Verify facts immediately
   - Write concise article
   - Publish article
   - Enable breaking banner in Traffic Control
   - Update as story develops

3. **Updating Breaking News:**
   - Update banner text as needed
   - Publish follow-up articles
   - Disable banner when story is no longer breaking

---

## Content Maintenance

### Regular Tasks

**Daily:**
- Monitor Analytics dashboard
- Update hero article if needed
- Refresh trending posts
- Check for corrections needed

**Weekly:**
- Review performance metrics
- Archive old articles if needed
- Plan upcoming content
- Update site configuration

**Monthly:**
- Analyze top performing articles
- Review category balance
- Plan feature articles
- Assess editorial workflow

---

## Roles & Permissions

### Admin
- Full access to all features
- Can manage users
- Can modify site configuration
- Can publish, edit, delete any article

### Editor
- Can create and edit articles
- Can publish articles
- Cannot modify site configuration
- Cannot manage users

---

## Troubleshooting

### Common Issues

**Article won't save:**
- Check validation errors
- Verify required fields are filled
- Check slug uniqueness

**Image won't upload:**
- Verify file is an image format
- Check file size (should be under 5MB)
- Ensure Supabase storage bucket exists

**Can't publish:**
- Verify all required fields
- Check validation errors
- Ensure content is not empty

---

## Best Practices

1. **Always verify facts** before publishing
2. **Use clear, accurate headlines**
3. **Include proper image credits**
4. **Link to reliable sources**
5. **Update breaking news promptly**
6. **Monitor analytics regularly**
7. **Maintain editorial standards**
8. **Respond to corrections quickly**

---

**Last Updated**: December 2024  
**Version**: 1.0







