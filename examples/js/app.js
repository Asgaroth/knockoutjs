/*global ko Router */
(function () {
  'use strict';

  var ENTER_KEY = 13;

  // a custom binding to handle the enter key (could go in a separate library)
  ko.bindingHandlers.enterKey = {
    init: function (element, valueAccessor, allBindingsAccessor, data) {
      var wrappedHandler, newValueAccessor;

      // wrap the handler with a check for the enter key
      wrappedHandler = function (data, event) {
        if (event.keyCode === ENTER_KEY) {
          valueAccessor().call(this, data, event);
        }
      };

      // create a valueAccessor with the options that we would want to pass to the event binding
      newValueAccessor = function () {
        return {
          keyup: wrappedHandler
        };
      };

      // call the real event binding's init function
      ko.bindingHandlers.event.init(element, newValueAccessor, allBindingsAccessor, data);
    }
  };

  // representa un unico gasto
  var Gasto = function (titulo, valor, categoria) {
    this.titulo = ko.observable(titulo);
    this.valor = ko.observable(valor);
    this.categoria = ko.observable(categoria);

    // nos dice si esta siendo editado
    this.editando = ko.observable(false);
  };

  // Modelo principal
  var ViewModel = function (gastos) {
    var self = this;

    // map array of passed in gastos to an observableArray of gasto objects
    self.gastos = ko.observableArray(ko.utils.arrayMap(gastos, function (gasto) {
      return new Gasto(gasto.titulo, gasto.valor, gasto.categoria);
    }));

    // el gasto actual
    self.actual = ko.observable(new Gasto('', '', ''));

    // agrega un nuevo gasto
    self.agregar = function () {
      var actual = self.actual();
      actual.valor( parseInt(actual.valor(), 10));
        self.gastos.push(actual);
        self.actual(new Gasto('', '', ''));
    };

    // eliminar un gasto
    self.eliminar = function (gasto) {
      self.gastos.remove(gasto);
    };

    // edit an item
    self.editarGasto = function (gasto) {
      gasto.editando(true);
    };

    // dejar de editar
    self.pararEdicion = function (gasto) {
      gasto.editando(false);
      if (!gasto.titulo().trim()) {
        self.eliminar(gasto);
      }
    };

    // cuenta todos los gastos
    self.numeroDeGastos = ko.computed(function () {
      return self.gastos().length;
    });

    // Total de gastos
    self.totalEnGastos = ko.computed(function () {
      var total = 0;
      $.each(self.gastos(), function(i, gasto){
        total += parseInt(gasto.valor(), 10);
      });
      return total;
    });


    // internal computed observable that fires whenever anything changes in our gastos
    ko.computed(function () {
      // store a clean copy to local storage, which also creates a dependency on the observableArray and all observables in each item
      localStorage.setItem('gastos-store', ko.toJSON(self.gastos));
    }).extend({
      throttle: 500
    }); // save at most twice per second
  };

  // check local storage for gastos
  var gastos = ko.utils.parseJson(localStorage.getItem('gastos-store'));

  // bind a new instance of our view model to the page
  var viewModel = new ViewModel(gastos || [
    {titulo: 'Civica', valor: 10000, categoria:"Transporte"},
    {titulo: 'Mecato', valor:25000, categoria:"Comida"},
    {titulo: 'Polas', valor:10000, categoria:"Entretenimiento"}
  ]);
  ko.applyBindings(viewModel);

})();