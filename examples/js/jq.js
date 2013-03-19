jQuery(function ($) {
  'use strict';

  var Utils = {
    uuid: function () {
      /*jshint bitwise:false */
      var i, random;
      var uuid = '';

      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }

      return uuid;
    },
    store: function (namespace, data) {
      if (arguments.length > 1) {
        return localStorage.setItem(namespace, JSON.stringify(data));
      } else {
        var store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      }
    }
  };

  var App = {
    init: function () {
      this.ENTER_KEY = 13;
      this.gastos = Utils.store('gastos-store');
      this.cacheElements();
      this.bindEvents();
      this.render();
    },
    cacheElements: function () {
      this.gastoTemplate = Handlebars.compile($('#gasto-template').html());
      this.footerTemplate = Handlebars.compile($('#footer-template').html());

      this.$main = $('#main');
      this.$lista = $('#gastos-lista');
      this.$newGasto = $('#new-gasto');
      this.$crearGasto = $('#gasto-crear');
      this.$footer = this.$main.find('tfoot');
    },
    bindEvents: function () {
      var list = this.$lista;
      this.$crearGasto.on('submit', this.agregar);
      list.on('dblclick', 'label', this.editarGasto);
      list.on('keypress', 'input', this.actualizar);
      list.on('click', '.eliminar', this.eliminar);
    },
    render: function () {
      this.$lista.html(this.gastoTemplate(this.gastos));
      this.$main.toggle(!!this.gastos.length);
      this.renderFooter();
      Utils.store('gastos-store', this.gastos);
    },
    renderFooter: function () {
      var numeroDeGastos = this.gastos.length;
      var total = 0;
      $.each(this.gastos, function(i, gasto){
        total += parseInt(gasto.valor, 10);
      });
      var footer = {
        numeroDeGastos: numeroDeGastos,
        totalEnGastos: total
      };

      this.$footer.toggle(!!numeroDeGastos);
      this.$footer.html(this.footerTemplate(footer));
    },
    // accepts an element from inside the `.item` div and
    // returns the corresponding todo in the gastos array
    getGasto: function (id, callback) {

      $.each(this.gastos, function (i, val) {
        if (val.id === id) {
          callback.apply(App, arguments);
          return false;
        }
      });
    },
    agregar: function (e) {
      e.preventDefault();
      var $titulo = $(this).find("#titulo-input");
      var $valor = $(this).find("#val-input");
      var $categoria = $(this).find("#categoria-input");

      App.gastos.push({
        id: Utils.uuid(),
        titulo: titulo.val(),
        valor: valor.val(),
        categoria: categoria.val()
      });

      $titulo.val('');
      $valor.val('');
      $categoria.val('');
      App.render();
      return false;
    },
    editarGasto: function () {
      $(this).closest('tr').addClass('editando');
    },
    actualizar: function (e) {
      // Solo si la tecla fue enter
      if (e.which === App.ENTER_KEY) {
        var padre = $(this).closest('tr');
        var $titulo = padre.find('input.edit');
        var $valor = padre.find('input.val');
        var $categoria = padre.find('select.cat');
        App.getGasto(padre.data('id'), function (i) {
          if ($titulo) {
            this.gastos[i].titulo = $titulo;
          } else {
            this.gastos.splice(i, 1);
          }
          this.render();
        });
      }

    },
    eliminar: function () {
      App.getGasto(this, function (i) {
        this.gastos.splice(i, 1);
        this.render();
      });
    }
  };

  App.init();
});