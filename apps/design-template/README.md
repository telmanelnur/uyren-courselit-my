# Uyren.AI Design Template

A modern, themeable design template extracted from the CourseLit web application, featuring a clean architecture without page widget logic and built-in theme editing capabilities.

## Features

### 🎨 **Theme System**
- **Dynamic Color Management**: Real-time color customization with CSS variables
- **Typography Controls**: Font family and size adjustments
- **Spacing Scale**: Customizable spacing system for consistent layouts
- **Dark Mode Toggle**: Built-in light/dark theme switching

### 🏗️ **Component Architecture**
- **BaseLayout**: Main layout wrapper with header, footer, and content area
- **SiteInfoProvider**: Context-based site configuration management
- **ThemeProvider**: Theme state management and customization
- **ThemeEditor**: Drawer-based theme editing interface

### 📱 **Responsive Design**
- Mobile-first responsive layout
- Adaptive navigation with mobile menu
- Optimized for all screen sizes

### 🚀 **Performance**
- No Redux dependencies
- Context-based state management
- Optimized re-renders with React hooks

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page with theme editor toggle
│   └── globals.css         # Global styles
├── components/
│   ├── BaseLayout.tsx      # Main layout component
│   ├── Header.tsx          # Responsive header with theme controls
│   ├── Footer.tsx          # Footer with site info
│   ├── SiteInfoProvider.tsx # Site configuration context
│   ├── ThemeProvider.tsx   # Theme management context
│   ├── ThemeEditor.tsx     # Theme editing drawer
│   └── index.ts            # Component exports
```

## Getting Started

### 1. Install Dependencies

```bash
cd apps/design-template
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
```

The template will be available at `http://localhost:3000`

### 3. Customize Site Information

Edit the default site info in `SiteInfoProvider.tsx`:

```typescript
const defaultSiteInfo: SiteInfo = {
  title: "Your Site Title",
  subtitle: "Your site description",
  logo: {
    file: "/path/to/logo.svg",
    thumbnail: "/path/to/logo.svg",
    caption: "Your Logo"
  },
  // ... other properties
};
```

### 4. Customize Default Theme

Modify the default theme in `ThemeProvider.tsx`:

```typescript
const defaultTheme: Theme = {
  id: "custom",
  name: "Custom Theme",
  theme: {
    colors: {
      primary: "#your-primary-color",
      secondary: "#your-secondary-color",
      // ... other colors
    },
    typography: {
      fontFamily: "Your Font, sans-serif",
      // ... other typography settings
    }
  }
};
```

## Usage

### Using BaseLayout

```tsx
import { BaseLayout } from '../components';

export default function MyPage() {
  return (
    <BaseLayout 
      title="Page Title"
      description="Page description"
      showThemeEditor={true} // Enable theme editor
    >
      {/* Your page content */}
    </BaseLayout>
  );
}
```

### Using Theme Context

```tsx
import { useTheme } from '../components';

function MyComponent() {
  const { theme, updateThemeColors, toggleDarkMode } = useTheme();
  
  return (
    <div style={{ color: theme.theme.colors.primary }}>
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

### Using Site Info Context

```tsx
import { useSiteInfo } from '../components';

function MyComponent() {
  const { siteInfo, updateSiteInfo } = useSiteInfo();
  
  return (
    <div>
      <h1>{siteInfo.title}</h1>
      <p>{siteInfo.subtitle}</p>
    </div>
  );
}
```

## Theme Editor

The theme editor provides a user-friendly interface for customizing:

- **Colors**: Primary, secondary, background, text, and accent colors
- **Typography**: Font family and base font size
- **Spacing**: Customizable spacing scale from 4px to 80px

### Accessing Theme Editor

1. **Toggle Button**: Click the floating theme button (top-right corner)
2. **Header Button**: Use the palette icon in the header (if enabled)

### Saving Changes

- Click "Save Changes" to apply theme modifications
- Use "Reset to Default" to restore original settings

## Customization

### Adding New Theme Properties

1. Extend the `Theme` interface in `ThemeProvider.tsx`
2. Add corresponding controls in `ThemeEditor.tsx`
3. Update the CSS variable generation in `BaseLayout.tsx`

### Adding New Site Info Properties

1. Extend the `SiteInfo` interface
2. Update the default state in `SiteInfoProvider.tsx`
3. Add corresponding UI controls as needed

### Styling Components

All components use the theme system for consistent styling:

```tsx
// Use theme colors
style={{ backgroundColor: theme.theme.colors.background }}

// Use theme spacing
className={`p-${theme.theme.spacing.md}`}

// Use theme typography
style={{ fontFamily: theme.theme.typography.fontFamily }}
```

## Dependencies

- **Next.js 15**: React framework
- **React 19**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Workspace packages**: Shared components and models

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Maintain theme consistency
4. Test responsive behavior
5. Update documentation for new features

## License

This template is part of the Uyren.AI project and follows the same licensing terms.

---

**Note**: This template is designed to be lightweight and focused on design customization. It excludes the complex page widget system from the original CourseLit application while maintaining the core theming and layout capabilities.
