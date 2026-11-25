import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-html-toastr',
  templateUrl: './html-toastr.component.html',
  styleUrls: ['./html-toastr.component.scss']
})
export class HtmlToastrComponent implements OnInit{
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }
  dismiss(){
    this.snackBar.dismiss();
  }
}
