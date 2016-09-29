var helper = {
  makeSelect: function(){
    var $select = $('<select multiple>');
    $.each(['Alice', 'Bob', 'Carol'], function(i, name){
      $('<option>').attr({
        "value": name.toLowerCase()
      }).text(name).appendTo($select);
    });
    return $select;
  }
}

describe("$(element).multiSelect()", function() {

  it("should be a jQuery plugin", function() {
    expect(function(){
      helper.makeSelect().multiSelect()
    }).not.toThrow();
  });

  it("should throw an error when called on something other than a <select> element", function() {
    expect(function(){
      $('<p>').multiSelect()
    }).toThrow();
  });

  it("should throw an error when called on a <select> element without a `multiple` attribute", function() {
    expect(function(){
      $('<select>').multiSelect()
    }).toThrow();
  });

});

describe("$(element).multiSelect().data('multiSelectContainer')", function() {
  var $select = helper.makeSelect().multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("should be a reference to the container element added by multiSelect", function() {
    expect(
      $container.is('div.multi-select-container')
    ).toBe(true);
  });

  it("should be inserted after the original <select>", function() {
    expect(
      $container.prev().is('select[multiple]')
    ).toBe(true);
  });

  it("should contain a button", function() {
    expect(
      $container.children('.multi-select-button').length
    ).toEqual(1);
  });

  it("should contain a menu", function() {
    expect(
      $container.children('.multi-select-menu').length
    ).toEqual(1);
  });

  it("should contain a menu item for each <option> in the original <select>", function() {
    expect(
      $container.find('.multi-select-menuitem').length
    ).toEqual(3);
  });

  it("should contain a checkbox for each <option> in the original <select>", function() {
    expect(
      $container.find('input:checkbox').length
    ).toEqual(3);
  });

});

describe("Calling .multiSelect() on a <select> with pre-selected <options>", function() {
  var $select = $('<select multiple>');
  $select.append('<option selected>Alice</option>');
  $select.append('<option selected>Bob</option>');
  $select.append('<option>Carol</option>');
  $select.multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("ticks the corresponding checkboxes in the menu", function() {
    expect(
      $container.find('input:checked').length
    ).toEqual(2);
  });
});

describe("Calling .multiSelect() on a <select> with disabled <options>", function() {
  var $select = $('<select multiple>');
  $select.append('<option selected>Alice</option>');
  $select.append('<option disabled>Bob</option>');
  $select.append('<option disabled>Carol</option>');
  $select.multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("disables the corresponding checkboxes in the menu", function() {
    expect(
      $container.find('input:disabled').length
    ).toEqual(2);
  });
});

describe("I can customise", function() {
  it("the HTML markup of the container element", function() {
    var $select = helper.makeSelect().multiSelect({
      containerHTML: '<span class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.is('span.my-custom-class')
    ).toBe(true);
  });

  it("the HTML markup of the button element", function() {
    var $select = helper.makeSelect().multiSelect({
      buttonHTML: '<b class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('b.my-custom-class').length
    ).toEqual(1);
  });

  it("the HTML markup of the menu element", function() {
    var $select = helper.makeSelect().multiSelect({
      menuHTML: '<nav class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('nav.my-custom-class').length
    ).toEqual(1);
  });

  it("the HTML markup of the menu item elements", function() {
    var $select = helper.makeSelect().multiSelect({
      menuItemHTML: '<li class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('li.my-custom-class').length
    ).toEqual(3);
  });

  it("the placeholder text shown when no selections have been made", function() {
    var $select = helper.makeSelect().multiSelect({
      placeholderText: 'My custom text'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('.multi-select-button').text()
    ).toEqual('My custom text');
  });
});

