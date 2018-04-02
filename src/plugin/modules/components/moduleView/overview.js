define([
    'knockout',
    'kb_ko/KO',
    'kb_ko/lib/viewModelBase',
    'kb_ko/lib/generators',
    'kb_common/html'
], function (
    ko,
    KO,
    ViewModelBase,
    gen,
    html
) {
    'use strict';

    let t = html.tag,
        div = t('div'),
        a = t('a'),
        pre = t('pre'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            // console.log('params', params);

            this.moduleInfo = params.moduleInfo;

            this.name = params.moduleName;

        }
    }
    
    function buildOwners() {
        return gen.foreach('moduleInfo.owners', div({},
            a({
                dataBind: {
                    attr: {
                        href: '"#people/" + $data'
                    },
                    text: '$data'
                },
                target: '_blank'
            })
        ));
    }

    // OVERVIEW Tab
    function buildOverview() {
        return table({
            class: 'table table-striped table-bordered',
        }, [
            tr([
                th('Module name'), 
                td({
                    dataBind: {
                        text: 'name'
                    }
                })
            ]),            
            tr([
                th('Version'), 
                td({
                    style: {
                        fontFamily: 'monospace'
                    },
                    dataBind: {
                        text: 'moduleInfo.ver'
                    }
                })
            ]),
            tr([
                th('Owners'), 
                td(buildOwners())
            ]),
            tr([
                th('Created'), 
                td({
                    dataBind: {
                        typedText: {
                            value: 'moduleInfo.ver',
                            type: '"date"',
                            format: '"MMM D, YYYY [at] h:MMa"'
                        }
                    }
                })
            ]),            
            tr([
                th('Description'), 
                td(pre({ 
                    style: { 
                        whiteSpace: 'pre-wrap', 
                        wordWrap: 'break-word' 
                    },
                    dataBind: {
                        text: 'moduleInfo.description'
                    }
                }))
            ])
        ]);
    }

    function template() {
        return buildOverview();
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return KO.registerComponent(component);
});