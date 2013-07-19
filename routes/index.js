
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render("index", { title: "Networks Workbench", js: "network/main" });
};

exports.nwStep1 = function (req, res) {
    res.render("networkStep", { step: 1 });
};

exports.nwStep2 = function (req, res) {
    res.render("networkStep", { step: 2 });
};

exports.nwStep3 = function (req, res) {
    res.render("networkStep", { step: 3 });
};

exports.nwStep4 = function (req, res) {
    res.render("networkStep", { step: 4 });
};


