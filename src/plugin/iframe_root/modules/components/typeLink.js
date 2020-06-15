define(['kb_knockout/registry', 'kb_knockout/lib/viewModelBase', 'kb_lib/html'], function (reg, ViewModelBase, html) {
    'use strict';

    const t = html.tag,
        a = t('a');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.name = params.name;
            this.id = params.id;
            this.newWindow = params.newWindow | false;
            this.tab = params.tab;
        }
    }

    function template() {
        return a({
            dataBind: {
                attr: {
                    href: '"/#spec/type/" + id + (tab ? "?tab="+tab : "")',
                    target: 'newWindow ? "_blank" : null'
                },
                text: 'id'
            }
        });
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
