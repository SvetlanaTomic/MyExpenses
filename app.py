from flask import Flask, jsonify, make_response, request, abort, url_for
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from datetime import datetime, timedelta
import os

auth = HTTPBasicAuth()


@auth.get_password
def get_password(username):
    if username == 'lana':
        return 'python'
    return None


@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Unauthorized access'}), 401)


app = Flask(__name__)
CORS(app)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'crud.sqlite')
db = SQLAlchemy(app)
ma = Marshmallow(app)


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.String(80))
    title = db.Column(db.String(120))
    description = db.Column(db.String(200))
    value = db.Column(db.Integer)
    date = db.Column(db.DATE)

    def __init__(self, user, title, description, value, date):
        self.userID = user
        self.title = title
        self.description = description
        self.value = value
        self.date = date


class ExpenceSchema(ma.Schema):
    class Meta:
        fields = ('id', 'userID', 'title', 'description', 'value', 'date')


expense_schema = ExpenceSchema
expenses_schema = ExpenceSchema(many=True)


@app.route('/myexp/api/expenses/<int:expense_id>', methods=['GET'])
@auth.login_required
def get_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if expense == not_found:
        abort(404)
    return make_json(expense)


@app.route('/myexp/api/expenses/<int:expense_id>', methods=['PUT'])
@auth.login_required
def update_expense(expense_id):
    expense = Expense.query.get(expense_id)

    if expense == not_found:
        abort(404)
    if not request.json:
        abort(400)

    if 'title' in request.json and type(request.json['title']) != str:
        abort(400)
    if 'description' in request.json and type(request.json['description']) is not str:
        abort(400)
    if 'value' in request.json and (
            type(request.json['value']) is not str and (type(request.json['value']) is not int)):
        abort(400)
    '''
    if 'userID' in request.json and type(request.json['userID']) is not int:
            abort(400)
    
    if 'date' in request.json :
        and type(request.json['date']) is not datetime
        abort(400)
    '''

    expense.title = request.json['title']
    expense.description = request.json['description']
    expense.value = int(request.json['value'])
    datePom = str(request.json['date'])
    expense.date = datetime.strptime(datePom.split('T')[0], '%Y-%m-%d')
    # expense.userID = request.json['userID']
    # mozda je glupo da se ovo menja

    db.session.commit()
    return make_json(expense)


@app.route('/myexp/api/expenses/<int:expense_id>', methods=['DELETE'])
@auth.login_required
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    db.session.delete(expense)
    db.session.commit()
    return make_json(expense)
    # popraviti


@app.route('/myexp/api/expenses', methods=['GET'])
@auth.login_required
def get_expenses():
    all_expenses = Expense.query.order_by(Expense.date.desc()).all()
    result = expenses_schema.dump(all_expenses)
    sum = 0
    for expense in result.data:
        sum = sum + expense['value']
    return jsonify({'expenses': [make_public_expense(expense) for expense in result.data], 'sum': sum})


@app.route('/myexp/api/expenses/', methods=['GET'])
@auth.login_required
def get_expenses_with_param():
    n = request.args.get("n")
    date = getTime(request.args.get('d'))
    datePom=datetime.today().date()
    if date == datePom:
        if (n is None) or n == 'undefined' or n=='' or n == '0':
            all_expenses = Expense.query.order_by(Expense.date.desc()).all()
        else:
            all_expenses = Expense.query.order_by(Expense.date.desc()).limit(n)
    else:
        if (n is None) or n == 'undefined' or n==''or n == '0':
            all_expenses = Expense.query.order_by(Expense.date.desc()).filter(and_(Expense.date >= date ,  Expense.date <= date.today()))
        else:
            all_expenses = Expense.query.order_by(Expense.date.desc()).filter(and_(Expense.date >= date, Expense.date <= date.today())).limit(n)
    result = expenses_schema.dump(all_expenses)
    sum = 0
    for expense in result.data:
        sum = sum + expense['value']
    return jsonify({'expenses': [make_public_expense(expense) for expense in result.data], 'sum': sum})


def getTime(argument):
    if argument == 'this week':
        time = datetime.today() - timedelta(days=datetime.today().isoweekday() % 7 - 1)
    elif argument == 'this month':
        time = datetime.today().replace(day=1)
    elif argument == 'this year':
        time = datetime.today().replace(month=1, day=1)
    else:
        time = datetime.today()
    return time.date()


@app.route('/myexp/api/expenses', methods=['POST'])
@auth.login_required
def create_expense():
    if not request.json or 'title' not in request.json:
        abort(400)

    # user=request.json['userID']
    user = "korisnik"
    title = request.json['title']
    description = request.json['description']
    value = int(request.json['value'])
    datePom = request.json['date']
    date = datetime.strptime(datePom, '%Y-%m-%d')

    new_expense = Expense(user, title, description, value, date)

    db.session.add(new_expense)
    db.session.commit()

    return make_json(new_expense), 201


@app.errorhandler(404)
@auth.login_required
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


def make_public_expense(expense):
    new_expense = {}
    for field in expense:
        if field == 'id':
            new_expense['uri'] = url_for('get_expense', expense_id=expense['id'], _external=True)
        else:
            new_expense[field] = expense[field]
    return new_expense


def make_json(expense):
    res = {}
    res['id'] = expense.id
    res['userID'] = expense.userID
    res['value'] = expense.value
    res['title'] = expense.title
    res['description'] = expense.description
    # res['date'] = datetime.strftime(expense.date, "%d.%m.%Y")
    res['date'] = datetime.strftime(expense.date, "%Y-%m-%d")
    return jsonify({'expense': make_public_expense(res)})


if __name__ == '__main__':
    app.run(debug=True)


