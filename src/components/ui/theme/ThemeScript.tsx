import {
  AccentThemeSchema,
  defaultAppearancePreference,
} from '@/models/appearance';
export function ThemeScript() {
  const script = `(function(){var root=document.documentElement;var fallback=${JSON.stringify(defaultAppearancePreference)};try{var value=JSON.parse(localStorage.getItem('semantic-web-theme')||'null');if(!value||!${JSON.stringify(AccentThemeSchema.options)}.includes(value.accent)||!['light','dark'].includes(value.mode))value=fallback;}catch(error){value=fallback;}root.classList.toggle('dark-mode',value.mode==='dark');root.dataset.theme=value.mode;root.dataset.accent=value.accent;try{root.dataset.motion=localStorage.getItem('portal-motion')==='"reduced"'?'reduced':'system';}catch(error){root.dataset.motion='system';}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
