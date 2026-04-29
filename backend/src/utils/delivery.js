/**
 * Calculates delivery cost based on the relative locations of the supplier and retailer.
 * 
 * Logic:
 * - same city → cost = 50
 * - same district → cost = 100
 * - same state → cost = 200
 * - different state → cost = 400
 * 
 * @param {Object} supplierAddress 
 * @param {Object} retailerAddress 
 * @returns {Object} { cost, type }
 */
const calculateDeliveryCost = (supplierAddress, retailerAddress) => {
  if (!supplierAddress || !retailerAddress) {
    return { cost: 400, type: 'interstate' }; // Fallback to maximum cost if address is missing
  }

  // Normalize strings to ensure accurate comparison
  const sCity = (supplierAddress.city || '').toLowerCase().trim();
  const rCity = (retailerAddress.city || '').toLowerCase().trim();

  const sDistrict = (supplierAddress.district || '').toLowerCase().trim();
  const rDistrict = (retailerAddress.district || '').toLowerCase().trim();

  const sState = (supplierAddress.state || '').toLowerCase().trim();
  const rState = (retailerAddress.state || '').toLowerCase().trim();

  // Check from tightest bound (city) to loosest bound (interstate)
  if (sCity && rCity && sCity === rCity) {
    return { cost: 50, type: 'city' };
  }

  if (sDistrict && rDistrict && sDistrict === rDistrict) {
    return { cost: 100, type: 'district' };
  }

  if (sState && rState && sState === rState) {
    return { cost: 200, type: 'state' };
  }

  // Default to different states
  return { cost: 400, type: 'interstate' };
};

module.exports = { calculateDeliveryCost };
