define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_lib/html'
], function (
    ko,
    reg,
    ViewModelBase,
    gen,
    html
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.rows = params.rows;
            this.table = params.table;

            if (!this.table.messages) {
                this.table.messages = {};
            }

            // console.log('got rows...', this.rows());

            // this.rows = ko.pureComputed(() => {
            //     const rows = params.rows.sorted((a, b) => {
            //         const c = this.table.sort.column();
            //         const x = this.table.sort.direction() * this.table.columnMap[c].sort.comparator(a[c], b[c]);
            //         return x;
            //     });
            //     return rows
            //     // return params.rows;
            // });

        }

        sortTable(a, b) {
            const c = this.table.sort.column();
            const dir = this.table.sort.direction() === 'asc' ? 1 : -1;
            const x = dir * this.table.columnMap[c].sort.comparator(a[c], b[c]);
            return x;
        }

        doSort(data) {
            const currentSortColumn = this.table.sort.column();
            const currentSortDirection = this.table.sort.direction();
            if (currentSortColumn === data.name) {
                if (currentSortDirection === 'asc') {
                    this.table.sort.direction('desc');
                } else {
                    this.table.sort.direction('asc');
                }
            } else {
                this.table.sort.column(data.name);
                this.table.sort.direction(currentSortDirection);
            }
        }

        calcColumnStyle(column) {
            const style = {
                width: column.width + '%'
            };
            if (column.cellStyle) {
                Object.assign(style, column.cellStyle);
            } else {
                Object.assign(style, {
                    padding: '4px'
                });
            }
            return style;
        }

        stringify(obj) {
            return '{' + Object.keys(obj).map((key) => {
                return key + ':' + String(obj[key]);
            }).join(',') + '}';
        }
    }

    // VIEW

    const t = html.tag,
        div = t('div'),
        span = t('span');

    const style = html.makeStyles({
        component: {
            css: {

            }
        },
        table: {
            css: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        },
        tableHeader: {
            css: {
                '-moz-user-select': 'none',
                '-webkit-user-select': 'none',
                '-ms-user-select': 'none',
                userSelect: 'none',
                backgroundColor: 'rgba(200,200,200,0.5)'
            }
        },
        tableHeaderColumn: {
            css: {
                display: 'inline-block',
                fontStyle: 'italic',
                // padding: '4px',
                cursor: 'pointer',
                userSelect: 'none'
            }
        },
        tableBody: {
            css: {
                flex: '1 1 0px',
                overflowY: 'auto'
            }
        },
        row: {
            css: {

            }
        },
        cell: {
            css: {
                display: 'inline-block',
                verticalAlign: 'top',
                wordBreak: 'break-all'
            }
        }
    });

    // TODO: seriously twisted withing and asing.
    // The issue is that the 'row' is lost in the with context without
    // setting it with as, and then unpacking again with with: 'row' below.
    // maybe use noChildContext for the column foreach?
    // Anyhoo, it works now.
    function buildRow() {
        return div({
            dataBind: {
                with: 'row',
                as: '"row"',
                // noChildContext: 'true',
                style: '$component.table.rowStyle',
                // log: 'table'
            }
        }, gen.foreachAs('$component.table.columns', 'column',
            // make the implicit context the row again.
            div({
                class: style.classes.cell,
                dataBind: {
                    style: '$component.calcColumnStyle(column)'
                }
            }, gen.if('column.component',
                // use the column specified for the column, using the
                // specified params (relative to row) as input.
                gen.with('row', span({
                    dataBind: {
                        component: {
                            name: 'column.component.name',
                            // hopefully params are relative to the row context...
                            params: 'eval("(" + $component.stringify(column.component.params) + ")")'
                        }
                    }
                })),
                // else use the row's column value directly
                gen.if('column.format',
                    span({
                        dataBind: {
                            typedText: {
                                value: 'row[column.name]',
                                type: 'column.format.type',
                                format: 'column.format.format'
                            }
                        }
                    }),
                    gen.if('column.html',
                        span({
                            dataBind: {
                                html: 'row[column.name]'
                            }
                        }),
                        span({
                            dataBind: {
                                text: 'row[column.name]'
                            }
                        })))))));
    }

    function buildHeader() {
        return div({
            class: style.classes.tableHeader
        }, gen.foreach('table.columns',
            div({
                class: style.classes.tableHeaderColumn,
                dataBind: {
                    style: '$component.calcColumnStyle($data)',
                    // style:  {
                    //     width: 'width + "%"'
                    // },
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
                            'fa-sort-desc': '$component.table.sort.column() === name && $component.table.sort.direction() === "desc"',
                            'fa-sort-asc': '$component.table.sort.column() === name && $component.table.sort.direction() === "asc"',
                            'fa-sort': '$component.table.sort.column() !== name'
                        },
                        style: {
                            color: '$component.table.sort.column() !== name ? "#AAA" : "#000"'
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

    function buildEmptyTable() {
        return div({
            class: 'well',
            style: {
                width: '50%',
                margin: '10px auto 0 auto',
                textAlign: 'center'
            }
        }, gen.if('table.messages.empty',
            div({
                dataBind: {
                    text: 'table.messages.empty'
                }
            }),
            div('This table is empty')));
    }

    function buildTable() {
        const rowTemplate = buildRow();
        return div({
            class: style.classes.table,
            dataBind: {
                style: {
                    'background-color': 'table.style && table.style.backgroundColor ? table.style.backgroundColor : "#FFF"'
                }
            }
        }, [
            buildHeader(),
            div({
                class: style.classes.tableBody
            }, gen.if('rows().length > 0',
                gen.foreachAs(
                    'rows.sorted((a,b) => {return $component.sortTable.call($component,a,b)})',
                    'row',
                    rowTemplate),
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
            stylesheet: style.sheet
        };
    }

    return reg.registerComponent(component);
});
