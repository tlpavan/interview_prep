# Plan: Custom Color Schemes for Technical & HR Interview Pages

## Context
The InterviewPrep AI platform has two mock interview pages: Technical and HR. Both currently use the same color scheme from `dashboard.css`. The goal is to differentiate them with distinct font/UI colors:
- **Technical**: Blue/tech-focused colors (modern, professional)
- **HR**: Warm/professional colors (approachable, people-focused)

The HTML already has `data-interview-type="technical"` and `data-interview-type="hr"` on the body tags, which we can use to apply conditional styling.

---

## Current State
- Both `technical.html` and `hr.html` load: `css/style-creative.css` + `css/dashboard.css`
- Colors defined in `dashboard.css` via CSS variables: `--ink`, `--ink-soft`, `--brand`, `--accent`, etc.
- No visual distinction between interview types

---

## Implementation Strategy

### Option 1: Override variables in dashboard.css (Simple)
Add conditional CSS at the bottom of `dashboard.css` that redefines color variables when `data-interview-type` is set.

**Pros**: One file to maintain, consistent with existing architecture  
**Cons**: Couples interview types to dashboard styles

### Option 2: Create separate CSS files (Modular)
Create `technical-theme.css` and `hr-theme.css` with custom variable overrides.

**Pros**: Clean separation, easier to modify independently  
**Cons**: Additional files, need to modify HTML to include them

### **Recommended: Option 1** (Most maintainable with minimal changes)
Add a new section at the end of `dashboard.css` with interview-type-specific variable overrides. This keeps everything in one place and leverages the existing CSS variable system.

---

## Detailed Changes

### File: `css/dashboard.css`

**Add at the END of the file** (after all existing styles, before final media queries if possible):

```css
/* ===== INTERVIEW-TYPE SPECIFIC THEMES ===== */

/* Technical Interview - Blue/Cyan Tech Theme */
[data-interview-type="technical"] {
  --ink: #0a192f;           /* Deep navy for main text */
  --ink-soft: #3b5c7d;     /* Medium blue-grey for secondary text */
  --brand: #0077b6;        /* Vibrant blue for headers/highlights */
  --accent: #00b4d8;       /* Cyan for accents/buttons */
  --accent-soft: #d4f1f9;  /* Light cyan for backgrounds */
  --surface: rgba(255, 255, 255, 0.88);
  --bg: #f0f5fa;           /* Light blue-tinted background */
}

[data-interview-type="technical"] .brand {
  color: var(--brand);
}

[data-interview-type="technical"] .primary-btn {
  background: linear-gradient(135deg, var(--brand), #0056b3);
  box-shadow: 0 16px 28px rgba(0, 119, 182, 0.22);
}

[data-interview-type="technical"] .module-bar,
[data-interview-type="technical"] .bar,
[data-interview-type="technical"] .mic-level-fill {
  background: linear-gradient(90deg, var(--brand), #00b4d8);
}

[data-interview-type="technical"] .progress-ring__inner,
[data-interview-type="technical"] .score-pulse__value,
[data-interview-type="technical"] .circle-score {
  color: var(--brand);
}

/* HR Interview - Warm Coral/Orange Theme */
[data-interview-type="hr"] {
  --ink: #4a3728;           /* Warm brown for main text */
  --ink-soft: #8b6f5c;     /* Medium taupe for secondary text */
  --brand: #d46a3a;        /* Coral/rust for headers/highlights */
  --accent: #f57c00;       /* Warm orange for accents/buttons */
  --accent-soft: #fff3e0;  /* Light peach for backgrounds */
  --surface: rgba(255, 248, 245, 0.92);
  --bg: #fff8f0;           /* Warm cream background */
}

[data-interview-type="hr"] .brand {
  color: var(--brand);
}

[data-interview-type="hr"] .primary-btn {
  background: linear-gradient(135deg, var(--brand), #c44d1f);
  box-shadow: 0 16px 28px rgba(212, 106, 58, 0.22);
}

[data-interview-type="hr"] .module-bar,
[data-interview-type="hr"] .bar,
[data-interview-type="hr"] .mic-level-fill {
  background: linear-gradient(90deg, var(--brand), #f57c00);
}

[data-interview-type="hr"] .progress-ring__inner,
[data-interview-type="hr"] .score-pulse__value,
[data-interview-type="hr"] .circle-score {
  color: var(--brand);
}

/* Interview-type specific section backgrounds */
[data-interview-type="technical"] .library-hero,
[data-interview-type="technical"] #interview-area,
[data-interview-type="technical"] .panel-card {
  background: var(--surface);
}

[data-interview-type="hr"] .library-hero,
[data-interview-type="hr"] #interview-area,
[data-interview-type="hr"] .panel-card {
  background: var(--surface);
}
```

---

## Verification Steps

1. **Start the development server** (if not running)
2. **Navigate to Technical Interview page** (`/technical.html`)
   - Verify primary text is dark navy/blue tones
   - Check headers use bright blue (#0077b6)
   - Confirm buttons have blue gradient
   - Progress bars and charts should be blue/cyan
   - Background should be light blue-tinted
3. **Navigate to HR Interview page** (`/hr.html`)
   - Verify primary text is warm brown tones
   - Check headers use coral/rust (#d46a3a)
   - Confirm buttons have orange/coral gradient
   - Progress bars and charts should be orange/coral
   - Background should be warm cream
4. **Check responsiveness** - ensure colors work on mobile
5. **Verify all functional elements** (mic, buttons, inputs) retain proper contrast ratios

---

## Files to Modify

1. **`css/dashboard.css`** - Add ~80 lines of conditional CSS at the end

No changes needed to HTML or JS files (data attribute already present).

---

## Additional Considerations

- **Accessibility**: Ensure color contrast ratios meet WCAG AA standards (4.5:1 for normal text). The chosen colors should be tested.
- **Consistency**: The theme changes should apply to all elements within the interview pages (buttons, progress bars, icons, etc.)
- **Print styles**: May need adjustments if users print interview pages (unlikely).

---

## Success Criteria

✅ Technical and HR pages have distinct, recognizable color schemes  
✅ All text remains readable with proper contrast  
✅ Buttons, progress bars, charts, and interactive elements adopt theme colors  
✅ No regression in existing functionality  
✅ Changes are contained to the interview pages only (dashboard, profile keep original colors)
