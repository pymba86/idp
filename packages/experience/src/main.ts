import {createApp, h} from 'vue';
import {createInertiaApp} from '@inertiajs/vue3';

const asyncViews = () => {
    return import.meta.glob('./pages/*.vue', {eager: true});
};

createInertiaApp({
    resolve: async name => {
        return asyncViews()[`./pages/${name}.vue`];
    },
    setup({el, App, props, plugin}) {
        createApp({
            setup: () => {
                delete el.dataset.page
            },
            render: () => h(App, props)
        })
            .use(plugin)
            .mount(el)
    },
});
