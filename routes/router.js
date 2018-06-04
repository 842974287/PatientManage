const router = require('koa-router')();
const Patient = require('../db/patient');

router.get('/', showMainPage)
    .get('/searchByName', searchByName)
    .get('/addNewPatient', addNewPatient)
    .get('/patientDetail', showPatientDetail);

async function showMainPage(ctx) {
    await ctx.render('main');
}

async function searchByName(ctx) {
    let patients = await Patient.find({ name: ctx.query.name });

    if (patients.length) {
        await ctx.render('patientList', {patients: patients});
    }
    else {
        let newPatient = new Patient({name : ctx.query.name});
        newPatient.save();

        await ctx.render('newPatient', { name: ctx.query.name });
    }
}

async function showPatientDetail(ctx) {

}

module.exports = router;
