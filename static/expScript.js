$.ajaxSetup({cache: false});

function ExpensesViewModel() {
    var self = this;
    self.expensesURI = 'http://localhost:5000/myexp/api/expenses';
    self.username = "lana";
    self.password = "python";
    self.expenses = ko.observableArray();
    self.sum = ko.observable();
    self.qu = [{ id: 0, name: 'all' }, { id: 5, name: 'last 5' }, { id: 10 , name: 'last 10' }, { id: 50, name: 'last 50' }];
    self.queries=ko.observableArray(self.qu);
    self.selectedQueryNum = ko.observable();
    self.period=ko.observableArray(['all', 'this week', 'this month', 'this year']);
    self.selectedQueryPeriod=ko.observable('all');

    self.active=false;
    self.sjow=true;
    self.ajax = function (uri, method, data) {
        var request = {
            url: uri,
            type: method,
            processData: false,
            contentType: "application/json",
            accepts: "application/json",
            cache: false,
            dataType: "json",
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization",
                    "Basic " + btoa(self.username + ":" + self.password));
            },


            success: function(jqXHR){
                self.show=true;
            },


            error: function (jqXHR) {
                console.log("ajax error " + jqXHR.status);
            }

        }


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
        self.ajax(self.expensesURI, 'POST', expense).then(function () {
            self.get_everything();
        })

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
        if(self.active) {
            self.show=false;
            self.ajax().abort();
            console.log('I am killing process!')
        }
        self.ajax(expense.uri(), 'PUT', data).then(function () {
            self.get_everything();
        })
    }
    self.remove = function (expense) {
        if(self.active) {
            self.show=false;
            self.ajax().abort();

            console.log('I am killing process!')
        }
        self.ajax(expense.uri(), 'DELETE').then(function () {
            self.get_everything();
        })
    }

    self.get_everything = function () {
        if(self.active) {
            self.show=false;
            self.newGet.abort();
            console.log('I am killing process!')
        }
        self.expenses.destroyAll();
        self.extension='/?n='+self.selectedQueryNum()+ '&d='+ self.selectedQueryPeriod();
        self.active=true;
        self.newGet=self.ajax(self.expensesURI+self.extension, 'GET').done(function (data) {
            if(self.show) {

                for (var i = 0; i < data.expenses.length; i++) {
                    self.expenses.push({
                        uri: ko.observable(data.expenses[i].uri),
                        title: ko.observable(data.expenses[i].title),
                        description: ko.observable(data.expenses[i].description),
                        date: ko.observable(data.expenses[i].date),
                        value: ko.observable(data.expenses[i].value),
                        userID: ko.observable(data.expenses[i].userID),

                    });
                    self.active = false;
                }
                //self.sum.destroyAll();
                self.sum(data.sum);
            }
        })
    }
    /*
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
        self.sum(data.sum);
    });
    */
    self.getNewQuery= function () {
        self.get_everything();
        /*
        if(self.active) {
            self.xhr().abort();
            console.log('I am killing process!')
            return;
        }
        self.expenses.destroyAll();
        self.extension='/?n='+self.selectedQueryNum()+ '&d='+ self.selectedQueryPeriod();
        self.ajax(self.expensesURI+self.extension, 'GET').done(function (data) {
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
        self.sum(data.sum);
    });
    */

    }

/*
    self.setQuery = function () {
        if(self.availableQueries=="all")
            self.number=ko.applyBindings(0);
        else if (self.availableQueries=="this week")
            self.number=ko.applyBindings(7);
         else if (self.availableQueries=="this month")
            self.number=ko.applyBindings(30);
          else (self.availableQueries=="this year")
            self.number=ko.applyBindings(365);

    }
    */
}


function AddExpenseViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();
    self.date = ko.observable();
    self.value = ko.observable();
    self.userID = ko.observable();

    self.addExpense = function () {
        $('#add').modal('hide');
        self.exp={
            title: self.title(),
            description: self.description(),
            date: self.date(),
            value: self.value(),
            userID: self.userID()
        }
        if(self.exp['title']==undefined ||self.exp['description']==undefined ||self.exp['date']==undefined ||self.exp['value']==undefined ){
            alert("Entered data ware not correct. Please fill all necessary fields correctly")
            //return;
        }

        expensesViewModel.add(self.exp);
        self.title("");
        self.description("");
        self.date("2019-02-06");
        self.value(0);
        self.userID("");

    }
}

function EditExpenseViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();
    self.date = ko.observable();
    self.value = ko.observable();
    self.userID = ko.observable();

    self.setExpense = function (expense) {
        self.expense = expense;

        self.title(expense.title());
        self.description(expense.description());
        console.log(expense.date().toString());
        self.date(expense.date().toString());
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

