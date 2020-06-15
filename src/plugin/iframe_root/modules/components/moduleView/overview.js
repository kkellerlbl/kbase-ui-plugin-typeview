define([
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_lib/html'
], function (
    reg,
    ViewModelBase,
    gen,
    html
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.moduleInfo = params.moduleInfo;
            this.name = params.moduleName;
        }
    }

    const t = html.tag,
        div = t('div'),
        a = t('a'),
        pre = t('pre'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');

    function buildOwners() {
        return gen.foreach('owners', div({},
            a({
                dataBind: {
                    attr: {
                        href: '"/#people/" + $data'
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
            gen.with('moduleInfo', [
                tr([
                    th('Version'),
                    td({
                        style: {
                            fontFamily: 'monospace'
                        },
                        dataBind: {
                            text: 'ver'
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
                                value: 'ver',
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
                            text: 'description'
                        }
                    }))
                ])
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

    return reg.registerComponent(component);
});