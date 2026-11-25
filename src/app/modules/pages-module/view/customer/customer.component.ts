import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Chart } from 'angular-highcharts';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { CommonService } from 'src/app/services/common.service';
import { DemoStoreService } from "src/app/services/configuration/demo-store.service";
import { environment } from 'src/environments/environment';
import * as Highcharts from 'highcharts';
// import highcharts3D from 'highcharts/highcharts-3d';
declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

import Histogram from 'highcharts/modules/histogram-bellcurve';
Histogram(Highcharts);

import highcharts3D from 'highcharts/highcharts-3d';
highcharts3D(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  private searchStringSubject = new Subject<any>();
  private searchBoxData = new Subject<string>();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  main: any;
  visualisation_data: any;
  viewId: any;
  selected_view_filter_name: any;
  view_details: any;
  all_card_details: any = [];
  card_headings: any = [];
  store_list: any = [];
  selected_store: any;
  view_display_name: any;
  show_store_specific: any;
  page: any = [];
  tableSize = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any = [];
  count: number = 0;
  card_search_id: any;
  search_card_data: any;
  link_value: any;
  filter_name: any
  display_key_variable: any;
  pathid: any;
  clickcardId: string;
  filter_type: any;
  search_text_box_data: any;
  donutChart: any = [];
  lineChart: any = [];
  options: any;

  constructor(
    public formbuilder: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private appComponent: AppComponent,
    private DemoStoreService: DemoStoreService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.pathid = this.route.parent.snapshot.params['slug'];
    this.clickcardId = localStorage.getItem('linkID');
  }


  ngOnInit(): void {
    this.main = this.appComponent.main;
    if (this.main.LoggedUserInfo.role_id != 6) {
      this.visualisation_data = JSON.parse(localStorage.getItem("visualisation_details"));
      var data = this.visualisation_data.filter((x: any) => x.url_path == window.location.pathname.split('/')[2]);
      if (data.length > 0 && this.generalSetting.visualization_module == 1) {
        this.viewId = data[0].master_view_id;
      } else {
        this.router.navigate(["/dashboard"])
      }
      var display_view_name = this.route.snapshot.params['slug'];
      this.view_display_name = this.visualisation_data.filter(x => x.url_path == display_view_name)[0];
      this.show_store_specific = this.view_display_name.specific_to;
      this.filter_name = this.view_display_name.filter_name;
      this.filter_type = this.view_display_name.filter_type;
      this.view_display_name = this.view_display_name.view_name;
      this.routhingChnage();
    } else {
      this.viewId = localStorage.getItem(`${this.pathid}displayViewId`);
      this.view_display_name = localStorage.getItem(`${this.pathid}displayViewName`);
      this.show_store_specific = localStorage.getItem(`${this.pathid}specifictoShowStore`);
      this.filter_name = localStorage.getItem(`${this.pathid}filterName`);
      this.filter_type = localStorage.getItem(`${this.pathid}showFilterType`);
    }
    if ((this.main.LoggedUserInfo.role_id == 1 && this.show_store_specific != 1) || (this.main.LoggedUserInfo.role_id == 6 && this.show_store_specific != 1)) {
      this.GeStoreList();
    } else {
      this.viewDetailsbyId();
    }

    this.searchStringSubject.pipe(debounceTime(environment.search_time)).subscribe((data) => {
      this.searchDetailCard(data.master_view_detail_id, data.searchQuery, data.index);
    })

    this.searchBoxData.pipe(debounceTime(environment.search_time)).subscribe((data) => {
      this.GetViewVisualization();
    })

    if (this.clickcardId) {
      this.selected_view_filter_name = Number(this.clickcardId);
      this.GetViewVisualization();
    }
    if (this.filter_type == 3) {
      this.GetViewVisualization();
    }
  }

  onSearchValue(cardId: any, searchQuery: any, index: any) {
    let data = {
      master_view_detail_id: cardId,
      searchQuery: searchQuery,
      index: index
    }
    this.searchStringSubject.next(data)
  }

  onSearchBoxValue(event: any) {
    console.log(event);
    this.search_text_box_data = event;
    this.searchBoxData.next(this.search_text_box_data);
    // this.GetViewVisualization();   
  }

  routhingChnage() {
    const routerSubscription = this.router.events.subscribe((event: any): void => {
      if (event.routerEvent instanceof NavigationEnd) {
        this.view_details = ''
        this.all_card_details = [];
        this.visualisation_data = JSON.parse(localStorage.getItem("visualisation_details"));
        var data = this.visualisation_data.filter((x: any) => x.url_path == window.location.pathname.split('/')[2]);
        this.viewId = data[0]?.master_view_id;
        var display_view_name = this.route.snapshot.params['slug'];
        this.view_display_name = this.visualisation_data.filter(x => x.url_path == display_view_name)[0];
        this.show_store_specific = this.view_display_name.specific_to;
        this.filter_name = this.view_display_name.filter_name;
        this.filter_type = this.view_display_name.filter_type;
        this.view_display_name = this.view_display_name.view_name;
        if ((this.main.LoggedUserInfo.role_id == 1 && this.show_store_specific != 1) || (this.main.LoggedUserInfo.role_id == 6 && this.show_store_specific != 1)) {
          this.GeStoreList();
        } else {
          this.viewDetailsbyId();
        }
      }
    })
  }

  viewDetailsbyId() {
    this.view_details = [];
    this.selected_view_filter_name = null;
    this.all_card_details = [];
    var data = {
      store_id: this.selected_store ? this.selected_store.store_id : this.main.LoggedUserStoreInfo.store_id,
      viewId: this.viewId,
    };
    this.commonService.viewDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.view_details = response.data;
          console.log(this.view_details);
          console.log(this.view_details == window.location.pathname.split('/')[2]);
          if (this.view_details.url_path == window.location.pathname.split('/')[2]) {

          } else {
            this.viewId = localStorage.getItem(`${this.pathid}displayViewId`);
            this.view_display_name = localStorage.getItem(`${this.pathid}displayViewName`);
            this.show_store_specific = localStorage.getItem(`${this.pathid}specifictoShowStore`);
            this.filter_name = localStorage.getItem(`${this.pathid}filterName`);
            this.filter_type = localStorage.getItem(`${this.pathid}showFilterType`);
            localStorage.removeItem(`${this.pathid}displayViewId`);
            localStorage.removeItem(`${this.pathid}displayViewName`);
            localStorage.removeItem(`${this.pathid}specifictoShowStore`);
            localStorage.removeItem(`${this.pathid}showFilterType`);
            localStorage.removeItem(`${this.pathid}filterName`);
            localStorage.setItem(`${this.view_details.url_path}displayViewId`, (this.view_details.master_view_id));
            localStorage.setItem(`${this.view_details.url_path}displayViewName`, this.view_details.view_name);
            localStorage.setItem(`${this.view_details.url_path}specifictoShowStore`, this.view_details.specific_to);
            localStorage.setItem(`${this.view_details.url_path}showFilterType`, this.view_details.filter_type);
            localStorage.setItem(`${this.view_details.url_path}filterName`, this.view_details.filter_name)
            this.viewId = localStorage.getItem(`${this.view_details.url_path}displayViewId`);
            this.view_display_name = localStorage.getItem(`${this.view_details.url_path}displayViewName`);
            this.show_store_specific = localStorage.getItem(`${this.view_details.url_path}specifictoShowStore`);
            this.filter_name = localStorage.getItem(`${this.view_details.url_path}filterName`);
            this.filter_type = localStorage.getItem(`${this.view_details.url_path}showFilterType`);
            this.router.navigate([`/customer-view/${this.view_details.url_path}`]);
          }
        } else {

        }
      }
    });
  }

  GetViewVisualization() {
    this.page = [];
    if (this.filter_type == 1) {
      var data: any = {
        master_view_id: this.viewId,
        Search_String: this.search_text_box_data,
        store_id: this.selected_store ? this.selected_store.store_id : this.main.LoggedUserStoreInfo.store_id
      };
    } else if (this.filter_type == 3) {
      var data: any = {
        master_view_id: this.viewId,
        store_id: this.selected_store ? this.selected_store.store_id : this.main.LoggedUserStoreInfo.store_id
      };
    } else {
      var data: any = {
        master_view_id: this.viewId,
        relation_key: this.selected_view_filter_name,
        store_id: this.selected_store ? this.selected_store.store_id : this.main.LoggedUserStoreInfo.store_id
      };
    }
    localStorage.removeItem('linkID')
    this.commonService.viewVisualization(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.all_card_details = response.data;

          if (response.data.length > 0) {
            this.all_card_details.forEach((element: any, index: number) => {
              if (element.cardData.length == 0) {
                this.selected_view_filter_name = null;
                this.toastr.error("The associated details for the record not found!");
              } else {
                if (element.coloumns_to_view) {
                  element.cardDatas = []
                  element.coloumns_to_view = element.coloumns_to_view.split(", ");
                  element.cardData.forEach((row_item: any) => {
                    let columns_data = Object.values(row_item)
                    element.cardDatas.push(columns_data);
                  });
                  if (element.paging_limit) {
                    element.totalPages = Math.ceil(element.count / element.paging_limit);
                    element.pageNumberArray = this.updatePageNumbers(Math.ceil(element.count / element.paging_limit));
                    this.page[index] = 1;
                  }
                }
              }
            });
            console.log(this.all_card_details);
            setTimeout(() => {
              this.createMultipleCharts();
              this.createMultipleLineCharts();
            }, 1000);
          }
        } else {
        }
      }
    });
  }

  // Pie and Donut Charts
  private createMultipleCharts(): void {
    this.all_card_details.forEach((cardDetails: any, index) => {
      if (cardDetails.view_type == 3 || cardDetails.view_type == 4) {
        const chart_list: any = [];
        cardDetails.cardData.forEach(data => {
          chart_list.push({
            name: data[0],
            y: Number(data[1])
          });
        });

        console.log(this.all_card_details);

        // Create chart options
        this.options = {
          chart: {
            type: 'pie',
            options3d: {
              enabled: cardDetails.view_dimension == 2 ? true : false,
              alpha: 45
            }
          },
          title: {
            text: "",
            align: "center",
            verticalAlign: "middle",
            y: 0,
          },
          legend: {
            // floating: true,
            align: cardDetails.legend_position == 'Right' ? 'right' : cardDetails.legend_position == 'Left' ? 'left' : 'center',
            layout: (cardDetails.legend_position == 'Top' || cardDetails.legend_position == 'Bottom') ? 'horizontal' : 'vertical',
            verticalAlign: cardDetails.legend_position == 'Top' ? 'top' : cardDetails.legend_position == 'Bottom' ? 'bottom' : 'middle',
            // width: 500,
            // x: 10,
            // y: 0
          },
          tooltip: {
            enabled: cardDetails.display_type == 1 ? true : false,
            pointFormatter: (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 0) ? function () {
              return '<b>' + this.name + '</b>';
            } :
              (cardDetails.chart_display.Label == 0 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 0) ? function () {
                return '(<b>' + Highcharts.numberFormat(this.percentage, 2) + '%' + '</b>)';
              } :
                (cardDetails.chart_display.Label == 0 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 1) ? function () {
                  return '(<b>' + this.series.name + ': </b>' + '<b>' + this.y + '</b>)';
                } :
                  (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 0) ? function () {
                    return '<b>' + this.name + '</b><br/>' + '(<b>' + Highcharts.numberFormat(this.percentage, 2) + '%' + '</b>)';
                  } :
                    (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 1) ? function () {
                      return '<b>' + this.name + '</b><br/><b>(' + this.series.name + ': </b>' + '<b>' + this.y + '</b>)';
                    } :
                      (cardDetails.chart_display.Value == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Label == 0) ? function () {
                        return '(<b>' + this.series.name + ': </b>' + '<b>' + this.y + '</b>, ' + '<b>' + Highcharts.numberFormat(this.percentage, 2) + '%' + '</b>)';
                      } :
                        (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 1) ? function () {
                          return '<b>' + this.name + '</b><br/>' + '(<b>' + this.series.name + ': </b>' + '<b>' + this.y + '</b>, ' + '<b>' + Highcharts.numberFormat(this.percentage, 2) + '%' + '</b>)';
                        } : '',
            headerFormat: '',
            // pointFormat: (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 0) ? '{point.name}' : (cardDetails.chart_display.Label == 0 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 0) ? '{point.percentage:.1f} %' : (cardDetails.chart_display.Label == 0 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 1) ? '({series.name}</b>:{point.y})' :
            //   (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 0) ? '{point.name} <br> (</b>: {point.percentage:.1f} %)' : (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 1) ? '{point.name} <br> ({series.name}</b>: {point.y})' :
            //     (cardDetails.chart_display.Value == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Label == 0) ? '({series.name}</b>: {point.y}, {point.percentage:.1f} %)' :
            //       (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 1) ? '{point.name} <br> ({series.name}</b>: {point.y}, <br> {point.percentage:.1f} %)' : '',
            // valueDecimals: 2
          },
          credits: {
            enabled: false,
          },
          plotOptions: {
            pie: {
              allowPointSelect: false,
              cursor: cardDetails.display_type == 1 ? "pointer" : "",
              depth: 40,
              dataLabels: {
                enabled: cardDetails.display_type == 2 ? true : false,
                // format: '{point.name} </b>: {point.y}',
                format: (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 0) ? '{point.name}' : (cardDetails.chart_display.Label == 0 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 0) ? '{point.percentage:.2f} %' : (cardDetails.chart_display.Label == 0 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 1) ? '({series.name}</b>:{point.y})' :
                  (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 0) ? '{point.name} <br> (</b>: {point.percentage:.2f} %)' : (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 0 && cardDetails.chart_display.Value == 1) ? '{point.name} <br> ({series.name}</b>: {point.y})' :
                    (cardDetails.chart_display.Value == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Label == 0) ? '({series.name}</b>: {point.y:.1f}, {point.percentage:.2f} %)' :
                      (cardDetails.chart_display.Label == 1 && cardDetails.chart_display.ValueTotal == 1 && cardDetails.chart_display.Value == 1) ? '{point.name} <br> ({series.name}</b>: {point.y}, <br> {point.percentage:.2f} %)' : '',
                distance: 10,
                style: {
                  fontWeight: "bold",
                  color: "black",
                },
              },
              showInLegend: cardDetails.display_type == 2 || cardDetails.legend_position == "None" ? false : true,
              startAngle: -90,
              endAngle: -180,
              center: ["50%", "50%"],
              size: "80%",
            },
          },
          series: [{
            name: cardDetails.chart_value,
            type: "pie",
            // innerSize: "0%",
            innerSize: cardDetails.view_type == 4 ? "50%" : "0%",
            data: chart_list
          }],
          exporting: {
            enabled: true, // for context menu
          }
        };
        const chart = Highcharts.chart('container' + index, this.options);
        cardDetails.donutChart = chart;

      }
    });
  }

  // Line Charts
  private createMultipleLineCharts(): void {
    this.all_card_details.forEach((cardDetails: any, index) => {
      if (cardDetails.view_type == 3 || cardDetails.view_type == 4) {
        const value_list: any = [];
        const label_list:any =[];
        cardDetails.cardData.forEach(data => {
          value_list.push(Number(data[1]));
          label_list.push(data[0]);
        });

        console.log(this.all_card_details);

        // Create chart options
        this.options = {
          chart: {
            type: 'line',
            options3d: {
              enabled: false,
              alpha: 15,
              beta: 30,
              depth: 200
            }
          },
          title: {
            text: "",
            align: "center",
            verticalAlign: "middle",
            y: 0,
          },
          
          tooltip: {
            enabled: true,            
            headerFormat: '',
          },
          credits: {
            enabled: false,
          },
          xAxis: {
            categories: label_list,
            title: {
              text: cardDetails.chart_label,
            },
          },
          yAxis: {
            tickInterval: 10000,
            endOnTick: false,
            title: {
              text: cardDetails.chart_value,
            },
          },

          series: [{
            name: cardDetails.chart_value,
            type: "line",
            data: value_list
          }],
        //   series: [{
        //     name: 'Installation & Developers',
        //     data: [43934, 48656, 65165, 81827, 112143, 142383,
        //         171533, 165174, 155157, 161454, 154610]
        // }, {
        //     name: 'Manufacturing',
        //     data: [24916, 37941, 29742, 29851, 32490, 30282,
        //         38121, 36885, 33726, 34243, 31050]
        // }, {
        //     name: 'Sales & Distribution',
        //     data: [11744, 30000, 16005, 19771, 20185, 24377,
        //         32147, 30912, 29243, 29213, 25663]
        // }, {
        //     name: 'Operations & Maintenance',
        //     data: [null, null, null, null, null, null, null,
        //         null, 11164, 11218, 10077]
        // }, {
        //     name: 'Other',
        //     data: [21908, 5548, 8105, 11248, 8989, 11816, 18274,
        //         17300, 13053, 11906, 10073]
        // }],
          exporting: {
            enabled: true, // for context menu
          }
        };
        const chart = Highcharts.chart('linecontainer' + index, this.options);
        cardDetails.lineChart = chart;

      }
    });
  }

  updatePageNumbers(totalPages: number) {
    let pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  GeStoreList() {
    var data = {
      is_verified: 2,
      khata_user: 0,
      market_type: 2
    };
    this.DemoStoreService.getSellerListRecord(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.store_list = response.data;
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  searchDetailCard(cardId: any, searchQuery: any, index: any) {
    this.card_search_id = cardId;
    this.searchCard(1, searchQuery, index);
    this.page[index] = 1;
  }

  searchCard(page: any, searchQuery: any, index: any, card_id?: any) {
    this.search[index] = searchQuery;
    var data: any = {
      master_view_detail_id: this.card_search_id ? this.card_search_id : card_id,
      page: page,
      search_query: searchQuery,
      relation_key: this.selected_view_filter_name,
      store_id: this.selected_store ? this.selected_store.store_id : this.main.LoggedUserStoreInfo.store_id
    };
    if (this.filter_type == 1) {
      data.Search_String = this.search_text_box_data;
    }
    this.commonService.searchViewCard(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.search_card_data = response.data
          this.search_card_data.cardDatas = [];
          this.search_card_data.cardData.forEach((row_item: any) => {
            let columns_card_data = Object.values(row_item)
            this.search_card_data.cardDatas.push(columns_card_data);
          });

          this.all_card_details[index].cardDatas = this.search_card_data.cardDatas;
          this.all_card_details[index].count = this.search_card_data.count;
          if (this.search_card_data.paging_limit) {
            this.all_card_details[index].totalPages = Math.ceil(this.search_card_data.count / this.search_card_data.paging_limit);
            this.all_card_details[index].pageNumberArray = this.updatePageNumbers(Math.ceil(this.search_card_data.count / this.search_card_data.paging_limit));
          }
          this.cdr.detectChanges();

        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  isInteger(value: any): boolean {
    return typeof value === "number";
  }

  clearSearch(searchQuery: any, card_id: any, index: any) {
    this.searchDetailCard(card_id, "", index);
  }

  onPageChange(event: number, card_index: any, card_id: any) {
    const page = event;
    const searchQuery = this.search[card_index];
    this.page[card_index] = page;

    this.searchCard(page, searchQuery, card_index, card_id);
  }

  linkDetailsView(card_view: any, card_link_id: any) {
    if (card_view) {
      localStorage.setItem("linkID", card_link_id);
      var data = {
        store_id: this.selected_store ? this.selected_store.store_id : this.main.LoggedUserStoreInfo.store_id,
        viewId: card_view,
      };
      this.commonService.viewDetails(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            localStorage.setItem(`${response.data.url_path}displayViewId`, card_view);
            localStorage.setItem(`${response.data.url_path}displayViewName`, response.data.view_name);
            localStorage.setItem(`${response.data.url_path}specifictoShowStore`, response.data.specific_to);
            localStorage.setItem(`${response.data.url_path}filterName`, response.data.filter_name)
            window.open(`/customer-view/${response.data.url_path}`, '_blank').focus();
          } else {

          }
        },
        error: (error) => { },
        complete: () => { },
      });
    } else {
      return;
    }
  }

  clearSearchBox() {
    console.log(this.search_text_box_data);

    this.search_text_box_data = null;
    this.GetViewVisualization();
  }

  cancelClick() {
    if (this.main.LoggedUserInfo.role_id != 6) {
      history.back();
    } else {
      this.router.navigate(["/view-management"])
    }
  }

}
