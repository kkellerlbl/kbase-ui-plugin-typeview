define([
    'knockout',
    'kb_ko/KO',
    'kb_ko/lib/viewModelBase',
    'kb_common/html',
    '../../lib/syntax'
], function (
    ko,
    KO,
    ViewModelBase,
    html,
    syntax
) {
    'use strict';

    let t = html.tag,
        div = t('div'),
        code = t('code'),
        pre = t('pre');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.name = params.moduleName;

            let highlighted = syntax.highlightKIDL(params.moduleInfo.spec);
            this.typeSpec = syntax.replaceMarkedTypeLinksInSpec(name, highlighted.value);     
        }
    }

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

    return KO.registerComponent(component);
});