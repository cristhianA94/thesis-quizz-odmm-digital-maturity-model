import { Component, OnInit, Renderer, HostListener, Inject } from "@angular/core";
import { Location, DOCUMENT } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})

export class AppComponent implements OnInit {

  constructor(
    private renderer: Renderer,
    public location: Location,
    @Inject(DOCUMENT) document
  ) { }

  /* Efecto navbar al hacer scroll */
  @HostListener("window:scroll", ["$event"])

  onWindowScroll(e) {
    if (window.pageYOffset > 100) {
      var element = document.getElementById("navbar-top");
      if (element) {
        element.classList.remove("navbar-transparent");
        element.classList.add("bg-primary");
      }
    } else {
      var element = document.getElementById("navbar-top");
      if (element) {
        element.classList.add("navbar-transparent");
        element.classList.remove("bg-primary");
      }
    }
  }
  ngOnInit() {
    this.onWindowScroll(event);
  }
}
