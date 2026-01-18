// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';

export default withNuxt(
    // 1. Your custom rule overrides
    {
        rules: {
            'vue/first-attribute-linebreak': [
                'error',
                {
                    singleline: 'ignore',
                    multiline: 'below',
                },
            ],
            // It's also common to need this for Prettier:
            'vue/html-indent': 'off',
        },
    },
    // 2. Add Prettier at the end to turn off conflicting rules
    eslintConfigPrettier,
);
