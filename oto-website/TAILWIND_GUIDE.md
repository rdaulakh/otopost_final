# Tailwind CSS Usage Guide

## 🎉 Tailwind CSS is now installed and working!

### How to access the demo:
1. Go to `http://localhost:5176/tailwind-demo` in your browser
2. You'll see a complete example of Tailwind CSS in action

## 📚 Common Tailwind Classes vs Your Current CSS

### Background Colors
```css
/* Your current CSS */
background: #0a0a0f;

/* Tailwind equivalent */
className="bg-gray-900"
```

### Text Colors
```css
/* Your current CSS */
color: #ffffff;

/* Tailwind equivalent */
className="text-white"
```

### Gradients
```css
/* Your current CSS */
background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%);

/* Tailwind equivalent */
className="bg-gradient-to-br from-cyan-400 to-blue-500"
```

### Spacing
```css
/* Your current CSS */
padding: 20px;
margin: 0 auto;

/* Tailwind equivalent */
className="p-5 mx-auto"
```

### Flexbox
```css
/* Your current CSS */
display: flex;
justify-content: center;
align-items: center;

/* Tailwind equivalent */
className="flex justify-center items-center"
```

### Grid
```css
/* Your current CSS */
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 20px;

/* Tailwind equivalent */
className="grid grid-cols-3 gap-5"
```

### Hover Effects
```css
/* Your current CSS */
.button:hover {
  transform: scale(1.05);
  background: #ff1b6b;
}

/* Tailwind equivalent */
className="hover:scale-105 hover:bg-pink-500 transition-all duration-300"
```

## 🚀 How to Start Using Tailwind

### 1. Replace existing classes gradually
Instead of:
```jsx
<div className="hero-section home-hero">
```

Use:
```jsx
<div className="min-h-screen bg-gray-900 text-white py-20">
```

### 2. Use responsive design
```jsx
<div className="text-2xl md:text-4xl lg:text-6xl">
  Responsive text
</div>
```

### 3. Use hover and focus states
```jsx
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
  Click me
</button>
```

### 4. Use custom colors from your config
```jsx
<div className="bg-primary-500 text-primary-100">
  Using custom primary color
</div>
```

## 🎨 Your Custom Tailwind Config

I've set up custom colors that match your brand:
- `primary-*` (cyan/blue shades)
- `secondary-*` (pink/red shades)
- Custom animations: `fade-in`, `slide-up`, `bounce-slow`

## 📝 Next Steps

1. **Visit the demo**: Go to `/tailwind-demo` to see Tailwind in action
2. **Start converting**: Begin replacing CSS classes with Tailwind classes
3. **Use the docs**: Check [tailwindcss.com/docs](https://tailwindcss.com/docs) for more classes
4. **Keep your existing CSS**: You can use both Tailwind and your custom CSS together

## 💡 Pro Tips

- Use `className` instead of `class` in React
- Combine multiple classes: `className="bg-blue-500 text-white p-4 rounded-lg"`
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Use hover/focus prefixes: `hover:`, `focus:`, `active:`
- Use dark mode: `dark:bg-gray-800`

Happy coding with Tailwind CSS! 🎉
