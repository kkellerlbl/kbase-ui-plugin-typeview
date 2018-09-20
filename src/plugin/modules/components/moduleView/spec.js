define([
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_common/html',
    '../../lib/syntax'
], function (
    reg,
    ViewModelBase,
    html,
    syntax
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.name = params.moduleName;

            const highlighted = syntax.highlightKIDL(params.moduleInfo.spec);
            this.typeSpec = syntax.replaceMarkedTypeLinksInSpec(name, highlighted.value);
        }
    }

    const t = html.tag,
        div = t('div'),
        code = t('code'),
        pre = t('pre');

    // OVERVIEW Tab
    function buildSpec() {
        return div({
            style: {
                width: '100%'
            }
        }, [
            pre(code({
                class: 'kidl',
                dataBind: {
                    html: 'typeSpec'
                }
            }))
        ]);
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