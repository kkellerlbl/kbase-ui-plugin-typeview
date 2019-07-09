define(['kb_knockout/registry', 'kb_knockout/lib/viewModelBase', 'kb_knockout/lib/generators', 'kb_lib/html'], function (
    reg,
    ViewModelBase,
    gen,
    html
) {
    'use strict';

    const t = html.tag,
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
        return span(
            {
                dataBind: {
                    style: {
                        'font-weight': 'current ? "bold" : null'
                    }
                }
            },
            [
                a({
                    style: {
                        fontFamily: 'monospace'
                    },
                    dataBind: {
                        attr: {
                            href: '"/#spec/module/" + id',
                            target: 'newWindow ? "_blank" : null'
                        },
                        text: 'version'
                    }
                }),
                gen.if('current', ' (current)')
            ]
        );
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
