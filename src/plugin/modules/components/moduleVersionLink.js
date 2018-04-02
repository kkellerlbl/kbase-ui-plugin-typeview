define([
    'kb_ko/KO',
    'kb_ko/lib/viewModelBase',
    'kb_ko/lib/generators',
    'kb_common/html'
], function (
    KO,
    ViewModelBase,
    gen,
    html
) {
    'use strict';

    let t = html.tag,
        span = t('span'),
        a = t('a');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.version = params.version;
            this.id = params.id;
            this.current = params.current;
            this.newWindow = params.newWindow | false;
        }        
    }

    function template() {
        return span({
            dataBind: {
                style: {
                    'font-weight': 'current ? "bold" : null'
                }
            }
        }, [
            a({
                style: {
                    fontFamily: 'monospace'
                },
                dataBind: {
                    attr: {
                        href: '"#spec/module/" + id',
                        target: 'newWindow ? "_blank" : null'
                    },
                    text: 'version'
                }
            }),
            gen.if('current', ' (current)')
        ]);
            
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return KO.registerComponent(component);
});