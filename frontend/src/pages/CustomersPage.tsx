import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, CreditCard, Fuel, MapPin, Phone, Mail, Award, Code, X } from 'lucide-react';
import { customersApi } from '../services/api';
import { Customer } from '../types';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jsonRecords, setJsonRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [selectedJson, setSelectedJson] = useState<any | null>(null);

  const [newCust, setNewCust] = useState({
    CUSTOMER_ID: `C${Math.floor(100 + Math.random() * 900)}`,
    CUSTOMER_NAME: '',
    CUSTOMER_TYPE: 'Regular',
    FUEL_PREFERENCE: 'Petrol',
    PAYMENT_METHOD: 'UPI',
    CITY: 'Bengaluru',
    PHONE: '',
    EMAIL: '',
  });

  const fetchCustomers = async () => {
    try {
      const [custRes, jsonRes] = await Promise.all([
        customersApi.list(),
        customersApi.getJsonRecords(),
      ]);
      setCustomers(custRes);
      setJsonRecords(jsonRes);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await customersApi.create(newCust);
      setCustomers([created, ...customers]);
      setShowAddModal(false);
    } catch (err) {
      alert(`Error creating customer: ${err}`);
    }
  };

  const filtered = customers.filter((c) => {
    if (typeFilter && c.CUSTOMER_TYPE.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.CUSTOMER_NAME.toLowerCase().includes(q) ||
        c.CUSTOMER_ID.toLowerCase().includes(q) ||
        c.PHONE.includes(q) ||
        c.CITY.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customer Intelligence & Loyalty
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles, fleet accounts & semi-structured JSON VARIANT records from SMART_PETROL_DB.CUSTOMER_DATA
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50"
          >
            <Code className="w-4 h-4 text-emerald-600" />
            <span>JSON VARIANT Data ({jsonRecords.length})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Customer Types</option>
            <option value="Regular">Regular</option>
            <option value="Premium">Premium</option>
            <option value="Fleet">Commercial Fleet</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div
            key={c.CUSTOMER_ID}
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm">
                    {c.CUSTOMER_NAME.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {c.CUSTOMER_NAME}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">{c.CUSTOMER_ID}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.CUSTOMER_TYPE === 'Fleet'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                      : c.CUSTOMER_TYPE === 'Premium'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  }`}
                >
                  {c.CUSTOMER_TYPE}
                </span>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pref: <strong className="text-slate-800 dark:text-slate-200">{c.FUEL_PREFERENCE}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pay: <strong className="text-slate-800 dark:text-slate-200">{c.PAYMENT_METHOD}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.CITY}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.PHONE}</span>
                </div>
              </div>
            </div>

            {/* Lifetime Spend Banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg flex items-center justify-between text-xs mt-2 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Station Spend</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  ₹{(c.total_spent || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Fuel Volume</span>
                <p className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                  {(c.total_litres || 0).toFixed(1)} L
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: JSON VARIANT Data Inspector */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Snowflake Semi-Structured VARIANT Inspector
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  CUSTOMER_DATA.CUSTOMER_JSON_DATA (RAW_DATA:VARIANT)
                </p>
              </div>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Snowflake natively parses schemaless JSON payloads into the VARIANT column, enabling dot-notation SQL queries like:
              </p>
              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
{`SELECT 
    RAW_DATA:customer_id::VARCHAR AS CUSTOMER_ID,
    RAW_DATA:customer_name::VARCHAR AS CUSTOMER_NAME,
    RAW_DATA:loyalty_tier::VARCHAR AS TIER,
    RAW_DATA:fleet_size::INT AS FLEET_UNITS
FROM CUSTOMER_DATA.CUSTOMER_JSON_DATA;`}
              </pre>

              <div className="space-y-3 mt-4">
                <span className="font-bold text-slate-800 dark:text-white">Live Records in Database:</span>
                {jsonRecords.map((item) => (
                  <div key={item.JSON_ID} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>JSON_ID: #{item.JSON_ID}</span>
                      <span>Loaded: {item.LOADED_AT}</span>
                    </div>
                    <pre className="text-slate-800 dark:text-slate-200 overflow-x-auto">
                      {JSON.stringify(item.RAW_DATA, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Customer Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newCust.CUSTOMER_NAME}
                  onChange={(e) => setNewCust({ ...newCust, CUSTOMER_NAME: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Customer Type</label>
                  <select
                    value={newCust.CUSTOMER_TYPE}
                    onChange={(e) => setNewCust({ ...newCust, CUSTOMER_TYPE: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="Fleet">Commercial Fleet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Fuel Preference</label>
                  <select
                    value={newCust.FUEL_PREFERENCE}
                    onChange={(e) => setNewCust({ ...newCust, FUEL_PREFERENCE: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="9000000010"
                    value={newCust.PHONE}
                    onChange={(e) => setNewCust({ ...newCust, PHONE: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={newCust.CITY}
                    onChange={(e) => setNewCust({ ...newCust, CITY: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
