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
        div = t('div'),
        span = t('span');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.table = params.table;
            
            this.tableDef = params.tableDef;
            if (!this.tableDef.messages) {
                this.tableDef.messages = {};
            }
        }        

        doSort(data) {
            let currentSortColumn = this.tableDef.sort.column();
            let currentSortDirection = this.tableDef.sort.direction();
            if (currentSortColumn === data.name) {
                if (currentSortDirection === 'asc') {
                    this.tableDef.sort.direction('desc');
                } else {
                    this.tableDef.sort.direction('asc');
                }
            } else {
                this.tableDef.sort.column(data.name);
                this.tableDef.sort.direction(currentSortDirection);
            }
        }
    }

    let styles = html.makeStyles({
        header: {
            css: {
                '-moz-user-select': 'none',
                '-webkit-user-select': 'none',
                '-ms-user-select': 'none',
                userSelect: 'none',
                borderBottom: '1px silver solid',
                overflowY: 'scroll'
            },
            pseudoElements: {
                '-webkit-scrollbar-track': {
                    backgroundColor: 'transparent'
                }
            }
        },
        headerColumn: {
            css: {
                display: 'inline-block',
                fontStyle: 'italic',
                padding: '4px',
                cursor: 'pointer',
                userSelect: 'none'
            }
        },
        row: {
            css: {

            },
            pseudoClasses: {
                hover: {
                    backgroundColor: 'rgba(200,200,200,0.5)'
                }
            }
        },
        cell: {
            css: {
                display: 'inline-block',
                padding: '4px'
            }
        }
    });

    function buildHeader() {
        return div({ 
            class: styles.classes.header
        }, gen.foreach('tableDef.columns',
            div({               
                class: styles.classes.headerColumn,
                dataBind: {
                    style:  {
                        width: 'width + "%"'
                    },
                    click: 'function (d, e) {$component.doSort.call($component,d,e);}'
                }
            }, [
                span({
                    dataBind: {
                        text: 'label'
                    }
                }),
                span({
                    dataBind: {
                        visible: 'sort',
                        css: {
                            'fa-sort-desc': '$component.tableDef.sort.column() === name && $component.tableDef.sort.direction() === "desc"',
                            'fa-sort-asc': '$component.tableDef.sort.column() === name && $component.tableDef.sort.direction() === "asc"',
                            'fa-sort': '$component.tableDef.sort.column() !== name'
                        },
                        style: {
                            color: '$component.tableDef.sort.column() !== name ? "#AAA" : "#000"'
                        }
                    },
                    style: {
                        marginLeft: '4px'
                    },
                    class: 'fa'
                })
            ])
        ));
    }

    function buildRow() {
        return div({
            class: styles.classes.row,
            dataBind: {
                with: 'row'
            }
        }, gen.foreachAs('$component.tableDef.columns', 'column', 
            // make the implicit context the row again.
            gen.if('column.component',  
                // use the column specified for the column, using the
                // specified params (relative to row) as input.               
                div({
                    style: {
                        display: 'inline-block',
                        padding: '4px'
                    },
                    dataBind: {
                        style:  {
                            width: 'column.width + "%"'
                        }
                    }
                }, span({
                    dataBind: {
                        component: {
                            name: 'column.component.name',
                            // hopefully params are relative to the row context...
                            params: 'eval("(" + column.component.params + ")")'
                            // params: {
                            //     username: 'username',
                            //     realname: 'realname'
                            // }
                        },
                        // text: 'column.component.name'
                    }
                })),
                gen.if('column.type', 
                    div({
                        class: styles.classes.cell,                   
                        dataBind: {
                            style:  {
                                width: 'column.width + "%"'
                            }
                        }
                    }, span({
                        dataBind: {
                            typedText: {
                                value: 'row[column.name]',
                                type: 'column.type',
                                format: 'column.format'
                            },
                            style: 'column.style'
                        }
                        // dataBind: {
                        //     text: 'column.format'
                        // }
                    })),
                    // else use the row's column value directly
                    div({
                        class: styles.classes.cell,
                        dataBind: {
                            style:  {
                                width: 'column.width + "%"'
                            }
                        }
                    }, span({
                        dataBind: {
                            text: 'row[column.name]',
                            style: 'column.style'
                        }
                    })))
            )));
    }

    function buildEmptyTable() {
        return div({
            class: 'well',
            style: {
                width: '50%',
                margin: '10px auto 0 auto',
                textAlign: 'center'
            }
        }, gen.if('tableDef.messages.empty', 
            div({
                dataBind: {
                    text: 'tableDef.messages.empty'
                }
            }),
            div('This table is empty')));
    }

    function buildTable() {
        // we loop across all the columns; remember, this is invoked 
        // within the row, so we need to reach back up to get the
        // row context.
        return div({
            style: {
                display: 'flex',
                flex: '1 1 0px',
                flexDirection: 'column'
            },
            dataBind: {
                style: {
                    'background-color': 'tableDef.style.backgroundColor'
                }
            }
        }, [
            buildHeader(),             
            div({
                style: {
                    overflowY: 'scroll',
                    flex: '1 1 0px'
                }
            }, gen.if('table().length > 0', 
                gen.foreachAs('table', 'row', buildRow()),
                buildEmptyTable()))
        ]);
    }

    function template() {
        return buildTable();
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template(),
            stylesheet: styles.sheet
        };
    }

    return KO.registerComponent(component);
});