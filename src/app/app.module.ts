import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { Chart, registerables } from 'chart.js';
import { DetailComponent } from './pages/detail/detail.component';
import { BoxComponent } from './box/box.component';

// Enregistrement des composants Chart.js
Chart.register(...registerables);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundComponent,
    DetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BoxComponent  // Import de BoxComponent ici
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
