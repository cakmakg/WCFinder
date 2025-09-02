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
        const result = await res.getModelList(Bussiness, {}, ["type", "owner"]);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Bussiness),
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
        req.body.owner = req.user?._id;

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
        const result = await Bussiness.findOne({ _id: req.params.id }).populate([
            { path: "type", select: "name" },
            { path: "owner", select: "firstName lastName email" },
        ]);

        if (!result) {
            return res.status(404).send({
                error: true,
                message: "Business not found",
            });
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
        const result = await Bussiness.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!result) {
            return res.status(404).send({
                error: true,
                message: "Business not found for update",
            });
        }

        res.status(202).send({
            error: false,
            result,
        });
    },

    // DELETE: Belirli bir işletmeyi silme
    delete: async (req, res) => {
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

    // İşletmeye katılma veya ayrılma
    joinbussiness: async (req, res) => {
        /*
          #swagger.tags=["Bussiness"]
          #swagger.summary="Join or leave a business"
          #swagger.description="Adds or removes the current user from the participants list of a business."
        */
        const businessId = req.params.bussinessId;
        const userId = req.user._id;

        if (!businessId || !userId) {
            return res.status(400).send({
                error: true,
                message: "Business ID or user ID not found."
            });
        }

        try {
            const business = await Bussiness.findById(businessId);

            if (!business) {
                return res.status(404).send({
                    error: true,
                    message: "Business not found."
                });
            }

            // Katılımcı listesinde kullanıcı varsa, çıkar
            if (business.participants.includes(userId)) {
                business.participants.pull(userId);
                await business.save();
                return res.status(200).send({
                    error: false,
                    message: "You have successfully left the business.",
                    result: business
                });
            } else {
                // Katılımcı listesinde kullanıcı yoksa, ekle
                business.participants.push(userId);
                await business.save();
                return res.status(200).send({
                    error: false,
                    message: "You have successfully joined the business.",
                    result: business
                });
            }
        } catch (error) {
            res.status(500).send({
                error: true,
                message: "An error occurred while trying to join or leave the business."
            });
        }
    },
};