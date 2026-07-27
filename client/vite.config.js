import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:3000'
        }
    },
    plugins: [
        {
            name: 'move-script-to-body-end',
            transformIndexHtml(html) {
                // Move script dari head ke akhir body, strip crossorigin & type=module
                const scriptMatch = html.match(/<script[^>]*src="[^"]*"[^>]*><\/script>/);
                if (!scriptMatch) return html;
                const script = scriptMatch[0]
                    .replace(/\s+crossorigin(?:\s*=\s*["'][^"']*["'])?/g, '')
                    .replace(/\s+type=["']module["']/g, '');
                return html
                    .replace(scriptMatch[0], '')
                    .replace(/<\/body>/i, `  ${script}\n</body>`);
            }
        }
    ],
    build: {
        target: 'es2018',
        rollupOptions: {
            output: {
                format: 'iife',
                inlineDynamicImports: true
            }
        }
    }
});
