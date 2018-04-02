define([
    'kb_ko/KO',
    'kb_ko/lib/viewModelBase',
    'kb_common/html'
], function (
    KO,
    ViewModelBase,
    html
) {
    'use strict';

    let t = html.tag,
        a = t('a');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.name = params.name;
            this.id = params.id;
            this.newWindow = params.newWindow | false;
        }        
    }

    function template() {
        return a({
            dataBind: {
                attr: {
                    href: '"#spec/type/" + id',
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

    return KO.registerComponent(component);
});