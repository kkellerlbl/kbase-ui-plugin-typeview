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

            // console.log('params', params);

            this.typeInfo = params.typeInfo;

            let [, typeModule, , , ] = /^([^.]+)\.([^-]+)-([^.]+)\.(.*)$/.exec(this.typeInfo.type_def);

            let highlighted = syntax.highlightKIDL(this.typeInfo.spec_def);
            this.typeSpec = syntax.replaceMarkedTypeLinksInSpec(typeModule, highlighted.value);     
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