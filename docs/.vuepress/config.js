module.exports = 
{
    title: 'Guía Esmeralda',
    description: 'Guía principalmente de desarrollo, que sirve como referencia para mostrar la forma de hacer ciertas cosas de forma opinada',
    
    markdown: {
        // options for markdown-it-anchor
        anchor: { permalink: true },
        
        // options for markdown-it-toc
        toc: { includeLevel: [2, 3] },
        
        config: md => {
            // use more markdown-it plugins!
            //md.use(require('markdown-it-xxx'))
        }
    },

    themeConfig: {
        //logo: '/assets/img/logo.png',
        lastUpdated: 'Actualizado por última vez', // string | boolean
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Google', link: 'https://google.com' },
        ],
        sidebar: [
            {
                title: 'Introducción',
                collapsable: true,
                children: [
                    '/funcionamiento-esta-guia/',
                ]
            },
            {
                title: 'Preparación entornos',
                collapsable: true,
                children: [
                    'instalacion-entorno-desarrollo/',
                ]
            },
            {
                title: 'Laravel',
                collapsable: true,
                children: [
                    'programacion-laravel/',
                    'programacion-laravel/autorizacion.md',
                    'programacion-laravel/graphql.md',
                    'programacion-laravel/test.md',
                ]
            },
            {
                title: 'Vue.js',
                collapsable: true,
                children: [
                    'programacion-vue/',
                ]
            },
            {
                title: 'Usabilidad',
                collapsable: true,
                children: [
                    'usabilidad/'
                ]
            }
            
        ]        
    }    
};

