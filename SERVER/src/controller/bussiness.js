"use strict";
/* -------------------------------------------------------
                Bussiness Controller
------------------------------------------------------- */

const Bussiness = require("../models/bussiness");

module.exports = {
    // GET: Tüm işletmeleri listeleme
    list: async (req, res) => {
        /*
          #swagger.tags=["Bussiness"]
          #swagger.summary="List all businesses"
          #swagger.description=`You can send query with endpoint for filter[], search[], sort[], page and limit. ...`
        */
        const filter = req.user?.isAdmin ? {} : { approvalStatus: 'approved' };
        const populateOptions = { 
            path: 'owner', 
            select: 'username' 
        };

        const result = await res.getModelList(Bussiness, filter, populateOptions);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Bussiness, filter),
            result,
        });
    },

    // POST: Yeni bir işletme oluşturma
    create: async (req, res) => {
        /*
          #swagger.tags=["Bussiness"]
          #swagger.summary="Create a new business"
          #swagger.parameters['body']={
            in: "body",
            required: true,
            schema: {
              "name": "My Business",
              "address": "123 Main St",
              "location": "Downtown",
              "coordinates": [40.7128, -74.0060],
              "type": "60c72b2f9b1e8e001c8e4a9e"
            }
          }
        */
        // Oturum açmış kullanıcının ID'sini `owner` alanına ekleyin
        req.body.owner = req.user._id;
        req.body.approvalStatus = 'pending';

        const result = await Bussiness.create(req.body);

        res.status(201).send({
            error: false,
            message: "Business created successfully",
            result,
        });
    },

    // GET: Belirli bir işletmeyi ID ile okuma
    read: async (req, res) => {
        /*
          #swagger.tags=["Bussiness"]
          #swagger.summary="Get a single business by ID"
        */
        const filter = req.user?.isAdmin ? { _id: req.params.id } : { _id: req.params.id, approvalStatus: 'approved' };
        // Modelinize uygun olarak `populate` güncellendi.
    const result = await Bussiness.findOne(filter).populate({
        path: 'owner', select: 'username email'
    });

         if (!result) {
        res.errorStatusCode = 404;
        throw new Error("Business not found or not approved.");
    }
    res.status(200).send({
        error: false,
        result,
    });
    },

    // PUT/PATCH: Belirli bir işletmeyi güncelleme
    update: async (req, res) => {
        /*
          #swagger.tags=["Bussiness"]
          #swagger.summary="Update an existing business"
          #swagger.parameters['body']={
            in: "body",
            required: true,
            schema: {
              "name": "My Updated Business",
              "address": "456 Side St",
            }
          }
        */
       const business = await Bssiness.findById(req.params.id);
         if (!business) {
        res.errorStatusCode = 404;
        throw new Error("Business not found.");
    }
    const isOwner = business.owner.toString() === req.user._id.toString();
    if (!req.user.isAdmin && !isOwner) {
        res.errorStatusCode = 403; // Forbidden
        throw new Error("You are not authorized to update this business.");
    }
     const updateData = req.body;
    // Bir işletmenin sahibi asla değiştirilemez.
    delete updateData.owner;
    // Onay durumunu sadece admin değiştirebilir.
    if (!req.user.isAdmin) {
        delete updateData.approvalStatus;
    }
// 4. Güvenli Veriyle Güncelleme Yap
    const result = await Bussiness.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(202).send({
        error: false,
        result,
    });
      
    },

    // DELETE: Belirli bir işletmeyi silme
    deletee: async (req, res) => {
        /*
          #swagger.tags=["Bussiness"]
          #swagger.summary="Delete a business"
        */
        const result = await Bussiness.deleteOne({ _id: req.params.id });

        if (result.deletedCount) {
            res.status(204).send(); // Silme başarılıysa 204 No Content döndür
        } else {
            res.status(404).send({
                error: true,
                message: "Business not found or already deleted",
            });
        }
    },

    
};