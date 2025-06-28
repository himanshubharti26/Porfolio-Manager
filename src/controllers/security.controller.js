import { securityDetail } from "../models/securityDetail.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getSecurities = asyncHandler(async (req, res) => {
    const { search, value } = req.query;
    let query = {};
    if (search && search.trim() !== "") {
        query.securityName = { $regex: search, $options: "i" };
    }
    if (value !== undefined && value !== "") {
        query.value = Number(value);
    }
    console.log("query=>", query);
    const stocks = await securityDetail.find(query, { value: 1, securityName: 1 }).limit(20);
    return res.status(200).json(
        new ApiResponse(200, stocks, "Stocks fetched successfully")
    );
});

const getSecurityById = asyncHandler(async (req, res) => {
    const { securityId } = req.params;
    if (!securityId) {
        throw new ApiError("Security ID is required", 400);
    }
    const security = await securityDetail.findById(securityId);
    if (!security) {
        throw new ApiError("Security not found", 404);
    }
    return res.status(200).json(
        new ApiResponse(200, security, "Security fetched successfully")
    );
});

const createSecurity = asyncHandler(async (req, res) => {
    const { securityName, value } = req.body;
    if (!securityName || typeof securityName !== "string" || !securityName.trim()) {
        throw new ApiError("Security name is required and must be a non-empty string", 400);
    }
    if (value === undefined || value === null || isNaN(Number(value))) {
        throw new ApiError("Value is required and must be a number", 400);
    }
    const newSecurity = new securityDetail({
        securityName: securityName.trim(),
        value: Number(value)
    });
    try {
        await newSecurity.save();
        return res.status(201).json(
            new ApiResponse(201, newSecurity, "Security created successfully")
        );
    } catch (error) {
        console.log("Error in creating security", error);
        throw new ApiError("Error in creating security", 500);
    }

});

const updateSecurity = asyncHandler(async (req, res) => {
    const { securityId, securityName, value } = req.body;
    if (!securityId) {
        throw new ApiError("Security ID is required", 400);
    }
    if (!securityName || typeof securityName !== "string" || !securityName.trim()) {
        throw new ApiError("Security name is required and must be a non-empty string", 400);
    }
    if (value === undefined || value === null || isNaN(Number(value))) {
        throw new ApiError("Value is required and must be a number", 400);
    }
    const updatedSecurity = await securityDetail.findByIdAndUpdate(
        securityId, 
        { securityName: securityName.trim(), value: Number(value) },
        { new: true }
    );
    if (!updatedSecurity) { 
        throw new ApiError("Security not found", 404);
    }
    return res.status(200).json(
        new ApiResponse(200, updatedSecurity, "Security updated successfully")
    );
});
export {
    getSecurities,
    getSecurityById,
    createSecurity,
    updateSecurity
}