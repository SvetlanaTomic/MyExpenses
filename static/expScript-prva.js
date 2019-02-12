$.ajaxSetup({cache: false});

function ExpensesViewModel() {
    var self = this;
    self.expensesURI = 'http://localhost:5000/myexp/api/expenses';
    self.username = "lana";
    self.password = "python";
    self.expenses = ko.observableArray();
    self.sum=ko.observableArray();
    self.ajax = function (uri, method, data) {
        var request = {
            url: uri,
            type: method,
            contentType: "application/json",
            accepts: "application/json",
            cache: false,
            dataType: 'json',
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization",
                    "Basic " + btoa(self.username + ":" + self.password));
            },
            /*
            success: function(XHR){
                console.log("success");
            },
            */
            error: function (jqXHR) {
                console.log("ajax error " + jqXHR.status);
            }
        };
        return $.ajax(request);
    }
    self.updateExpense = function (expense, newExpense) {
        var i = self.expenses.indexOf(expense);
        self.expenses()[i].uri(expense.uri);
        self.expenses()[i].title(newExpense.title);
        self.expenses()[i].description(newExpense.description);
        self.expenses()[i].value(newExpense.value);
        self.expenses()[i].userID(newExpense.userID);
        self.expenses()[i].date(newExpense.date);



    }
    self.beginAdd = function () {
        $('#add').modal('show');
    }
    self.add = function (expense) {
        self.ajax(self.expensesURI, 'POST', expense);
        self.get_everything()
    }
    /*
    self.add = function (expense) {
        self.ajax(self.expensesURI, 'POST', expense).done(function (data) {
            self.expenses.push({
                uri: ko.observable(data.expense.uri),
                title: ko.observable(data.expense.title),
                description: ko.observable(data.expense.description),
                date: ko.observable(data.expense.date),
                value: ko.observable(data.expense.value),
                userID: ko.observable(data.expense.userID),

            });

        });
        self.get_everything()
    }
    */
    self.beginEdit = function (expense) {
        editExpenseViewModel.setExpense(expense);
        $('#edit').modal('show');
    }
    self.edit = function (expense, data) {
        self.ajax(expense.uri(), 'PUT', data).done(function (res) {
            self.updateExpense(expense, res.expense);
        });
    }
    self.remove = function (expense) {
        self.ajax(expense.uri(), 'DELETE').done(function () {
            self.expenses.remove(expense);
        });
    }

    self.get_everything= function(){
        self.expenses.destroyAll()
        self.sum.destroyAll()
        self.ajax(self.expensesURI, 'GET').done(function (data) {
            for (var i = 0; i < data.expenses.length; i++) {
                self.expenses.push({
                    uri: ko.observable(data.expenses[i].uri),
                    title: ko.observable(data.expenses[i].title),
                    description: ko.observable(data.expenses[i].description),
                    date: ko.observable(data.expenses[i].date),
                    value: ko.observable(data.expenses[i].value),
                    userID: ko.observable(data.expenses[i].userID),

                });
            }
            self.sum.push(data.sum);
        })
    }

    self.ajax(self.expensesURI, 'GET').done(function (data) {
        for (var i = 0; i < data.expenses.length; i++) {
            self.expenses.push({
                uri: ko.observable(data.expenses[i].uri),
                title: ko.observable(data.expenses[i].title),
                description: ko.observable(data.expenses[i].description),
                date: ko.observable(data.expenses[i].date),
                value: ko.observable(data.expenses[i].value),
                userID: ko.observable(data.expenses[i].userID),

            });
        }
        self.sum.push(data.sum);
    });


}

function AddExpenseViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();
    self.date=ko.observable();
    self.value=ko.observable();
    self.userID=ko.observable();

    self.addExpense = function () {
        $('#add').modal('hide');
        expensesViewModel.add({
            title: self.title(),
            description: self.description(),
            date: self.date(),
            value: self.value(),
            userID: self.userID()
        });
        self.title("");
        self.description("");
        self.date("");
        self.value(0);
        self.userID("");

    }
}

function EditExpenseViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();
    self.date=ko.observable();
    self.value=ko.observable();
    self.userID=ko.observable();

    self.setExpense = function (expense) {
        self.expense = expense;

        self.title(expense.title());
        self.description(expense.description());
        self.date(new Date(expense.date()));
        self.value(expense.value());
        self.userID(expense.userID());
        $('edit').modal('show');
    }

    self.editExpense = function () {
        $('#edit').modal('hide');
        expensesViewModel.edit(self.expense, {
            title: self.title(),
            description: self.description(),
            date: self.date(),
            value: self.value(),
            userID: self.userID()
        });
    }


}

var expensesViewModel = new ExpensesViewModel();
var addExpenseViewModel = new AddExpenseViewModel();
var editExpenseViewModel = new EditExpenseViewModel();
ko.applyBindings(expensesViewModel, $('#main')[0]);
ko.applyBindings(addExpenseViewModel, $('#add')[0]);
ko.applyBindings(editExpenseViewModel, $('#edit')[0]);

