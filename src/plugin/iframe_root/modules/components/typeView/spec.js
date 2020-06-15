define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_lib/html', '../../lib/syntax'],
function (
    ko,
    reg,
    ViewModelBase,
    html,
    syntax
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.typeSpec = ko.pureComputed(() => {
                const [, module, , , ] = /^([^.]+)\.([^-]+)-([^.]+)\.(.*)$/.exec(
                    params.typeInfo().type_def
                );
                const highlighted = syntax.highlightKIDL(params.typeInfo().spec_def);
                return syntax.replaceMarkedTypeLinksInSpec(module, highlighted.value);
            });
        }
    }

    const t = html.tag,
        div = t('div'),
        code = t('code'),
        pre = t('pre');

    // OVERVIEW Tab
    function buildSpec() {
        return div(
            {
                style: {
                    width: '100%'
                }
            },
            [
                pre(
                    code({
                        class: 'kidl',
                        dataBind: {
                            html: 'typeSpec'
                        }
                    })
                )
            ]
        );
    }

    function template() {
        return buildSpec();
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
