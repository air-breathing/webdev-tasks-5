/**
 * Created by Надежда on 27.03.2016.
 */

const Remarks = require('../models/remarks');
Remarks.preload(
    function (err) {
        if (err != undefined) {
            console.log(err);
        }
    }
);


module.exports.getRemarks = function(req, res, next) {
    Remarks.getAll(function (err, data) {
        if (err != undefined) {
            console.log(err);
        }
        res.render('remark/remarks', {
            title: 'TODo-хИ' ,
            stylesheets: [
                'layout',
                'remarks',
                'remarkForm'
            ],
            scripts: [
                'remarks'
            ],
            data
        });
    });

};

module.exports.getRemarksJSON = function(req, res, next) {
    Remarks.getAll(function (err, data) {
        if (err != undefined) {
            console.log(err);
            res.status(500);
            res.send('');
        } else {
            res.send({data})
        }
    })
};

module.exports.newRemark = function(req, res, next) {
    console.log(req.body.text);
    Remarks.create(req.body.text, function (err, data) {
        if (err != undefined) {
            console.log(err);
        }
        res.send({id: data.id});
    });
};

module.exports.redoRemark = function(req, res, next) {
    Remarks.redo(req.params.id, req.body.text, function (err) {
        if (err != undefined) {
            console.log(err);
        } else {
            res.send({});
        }
    });
};

module.exports.deleteRemark = function(req, res, next) {
    Remarks.remove(req.params.id, function (err, data) {
        if (err != undefined) {
            console.log(err);
        } else {
            res.send();
        }
    });
};

module .exports.changeNumber = function(req, res, netx) {

};