import {createApp, h} from 'vue';
import {createInertiaApp} from '@inertiajs/vue3';

createInertiaApp({
    resolve: async name => {
        return (await import(`./pages/${name}.vue`)).default;

    },
    setup({ el, App, props, plugin }) {
        createApp({
            setup: () => {
                delete el.dataset.page
            },
            render: () => h(App, props) })
            .use(plugin)
            .mount(el)
    },
});
