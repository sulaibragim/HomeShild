import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Settings, History, Save, Trash2,
  Droplets, Wind, Thermometer, BrainCircuit, Info, Wrench, Sparkles,
  Camera, Image as ImageIcon, X
} from 'lucide-react';
import { 
  RefrigeratorIcon, 
  WasherIcon, 
  DryerIcon, 
  DishwasherIcon, 
  MicrowaveIcon, 
  CooktopIcon, 
  RangeIcon 
} from './icons/ApplianceIcons';
import { DiagnosticAssistant } from './DiagnosticAssistant';

const APPLIANCE_TYPES = [
  { id: 'refrigerator', name: 'Refrigerator', icon: RefrigeratorIcon, color: 'text-cyan' },
  { id: 'washer', name: 'Washer', icon: WasherIcon, color: 'text-violet' },
  { id: 'dryer', name: 'Dryer', icon: DryerIcon, color: 'text-amber-400' },
  { id: 'dishwasher', name: 'Dishwasher', icon: DishwasherIcon, color: 'text-emerald-400' },
  { id: 'microwave', name: 'Microwave', icon: MicrowaveIcon, color: 'text-pink-400' },
  { id: 'cooktop', name: 'Cooktop', icon: CooktopIcon, color: 'text-orange-400' },
  { id: 'range', name: 'Range / Oven', icon: RangeIcon, color: 'text-red-400' },
];

const calculateNextDate = (dateString: string, monthsToAdd: number) => {
  if (!dateString) return 'Not set';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <div className="w-11 h-6 bg-glass-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan peer-checked:after:bg-white"></div>
  </label>
);

function ApplianceDetail({ appliance, onBack, onSave, onDelete }: { appliance: any, onBack: () => void, onSave: (app: any) => void, onDelete: (id: number) => void }) {
  const typeInfo = APPLIANCE_TYPES.find(t => t.id === appliance.typeId);
  const Icon = typeInfo?.icon || RefrigeratorIcon;

  const [formData, setFormData] = useState(appliance);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMainIcon: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isMainIcon) {
          setFormData({ ...formData, customImage: result });
        } else {
          setFormData({ ...formData, gallery: [...(formData.gallery || []), result] });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...(formData.gallery || [])];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-full bg-glass hover:bg-glass-border transition-colors">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">{typeInfo?.name} Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDiagnostics(true)} 
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-colors text-lg"
          >
            <Wrench className="w-5 h-5" /> <span className="hidden md:inline">Run Diagnostics</span>
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className="flex items-center gap-2 px-4 py-3 bg-glass text-gray-400 border border-glass-border font-bold rounded-xl hover:bg-glass-border hover:text-white transition-colors text-lg"
          >
            <Trash2 className="w-5 h-5" /> <span className="hidden md:inline">Delete</span>
          </button>
          <button 
            onClick={() => onSave(formData)} 
            className="flex items-center gap-2 px-6 py-3 bg-cyan text-base font-bold rounded-xl hover:bg-cyan/90 transition-colors shadow-[0_0_20px_rgba(0,245,255,0.4)] text-lg text-black"
          >
            <Save className="w-5 h-5" /> <span className="hidden md:inline">Save Changes</span>
          </button>
        </div>
      </div>

      {showDiagnostics && (
        <DiagnosticAssistant 
          appliance={formData} 
          onClose={() => setShowDiagnostics(false)} 
          onSaveDiagnostic={(diagnostic) => {
            const existingHistory = formData.diagnosticsHistory || [];
            const existingIndex = existingHistory.findIndex((d: any) => d.id === diagnostic.id);
            
            let newHistory;
            if (existingIndex >= 0) {
              newHistory = [...existingHistory];
              newHistory[existingIndex] = diagnostic;
            } else {
              newHistory = [diagnostic, ...existingHistory];
            }

            const updated = {
              ...formData,
              diagnosticsHistory: newHistory
            };
            setFormData(updated);
            onSave(updated);
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Icon & Info Form & AI Insights */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Main Icon / Custom Photo */}
          <div className="glass-card p-8 flex flex-col justify-center items-center bg-gradient-to-b from-glass to-transparent relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-20 blur-3xl ${typeInfo?.color.replace('text-', 'bg-')}`}></div>
            
            <div className="relative z-10 w-48 h-48 flex items-center justify-center mb-4">
              {formData.customImage ? (
                <img 
                  src={formData.customImage} 
                  alt="Appliance" 
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-glass-border"
                />
              ) : (
                <Icon className={`w-full h-full ${typeInfo?.color} drop-shadow-[0_0_30px_currentColor]`} />
              )}
            </div>
            
            <label className="cursor-pointer z-10 flex items-center gap-2 px-4 py-2 bg-glass border border-glass-border rounded-lg hover:bg-glass-border transition-colors text-sm font-bold text-white">
              <Camera className="w-4 h-4" /> 
              {formData.customImage ? 'Change Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
            </label>
            {formData.customImage && (
              <button 
                onClick={() => setFormData({ ...formData, customImage: null })}
                className="mt-2 z-10 text-xs text-red-400 hover:text-red-300 underline"
              >
                Remove Custom Photo
              </button>
            )}
          </div>
          
          <div className="glass-card p-6 flex flex-col gap-5">
            <h3 className="text-xl font-display font-bold flex items-center gap-2 border-b border-glass-border pb-3">
              <Settings className="w-5 h-5 text-cyan" /> General Information
            </h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-400 font-medium">Brand</span>
                <input 
                  type="text" 
                  value={formData.brand || ''}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="bg-base border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan transition-colors text-lg"
                  placeholder="e.g. Samsung"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-400 font-medium">Model Number</span>
                <input 
                  type="text" 
                  value={formData.model || ''}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                  className="bg-base border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan transition-colors text-lg"
                  placeholder="e.g. RF28R7351SR"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-400 font-medium">Serial Number</span>
                <input 
                  type="text" 
                  value={formData.serial || ''}
                  onChange={e => setFormData({...formData, serial: e.target.value})}
                  className="bg-base border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan transition-colors text-lg"
                  placeholder="e.g. S/N 123456789"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-400 font-medium">Appliance Age</span>
                <input 
                  type="text" 
                  value={formData.age || ''}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="bg-base border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan transition-colors text-lg"
                  placeholder="e.g. 3 years"
                />
              </label>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col gap-5">
            <h3 className="text-xl font-display font-bold flex items-center gap-2 border-b border-glass-border pb-3">
              <BrainCircuit className="w-5 h-5 text-violet" /> AI Insights
            </h3>
            <div className="flex flex-col gap-4">
              {appliance.typeId === 'refrigerator' && (
                <div className="flex items-start gap-3 p-4 bg-violet/10 border border-violet/20 rounded-xl">
                  <Thermometer className="w-6 h-6 text-violet shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Recommended Temperatures</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Set your refrigerator to <strong className="text-white">37°F (3°C)</strong> and freezer to <strong className="text-white">0°F (-18°C)</strong> for optimal food preservation and energy efficiency.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-4 bg-cyan/10 border border-cyan/20 rounded-xl">
                <Info className="w-6 h-6 text-cyan shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Appliance Intelligence</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {formData.brand && formData.model ? 
                      `The ${formData.brand} ${formData.model} features advanced technology. Regular maintenance of the condenser coils and timely filter replacements will extend its lifespan by up to 30%.` : 
                      `Enter the brand and model number above to unlock specific AI insights, manuals, and common troubleshooting steps for this appliance.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gallery, Maintenance & Diagnostic History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Photo Gallery Card */}
          <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-glass-border pb-4">
              <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                <ImageIcon className="w-7 h-7 text-pink-400" />
                Gallery & Documents
              </h2>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-pink-400/10 text-pink-400 border border-pink-400/20 rounded-lg hover:bg-pink-400/20 transition-colors text-sm font-bold">
                <Plus className="w-4 h-4" /> Add Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.gallery?.map((img: string, i: number) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-glass-border bg-base/50">
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeGalleryImage(i)} 
                    className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(!formData.gallery || formData.gallery.length === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-glass-border rounded-2xl bg-base/30">
                  <ImageIcon className="w-12 h-12 text-gray-500 mb-3" />
                  <p className="text-gray-400 font-medium">No photos added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Upload photos of your appliance, serial number stickers, or receipts.</p>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance & Filters Card - Conditional based on type */}
          {['refrigerator', 'washer', 'dryer'].includes(appliance.typeId) && (
            <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-3 border-b border-glass-border pb-4">
                <Wrench className="w-7 h-7 text-cyan" />
                Maintenance & Filters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* REFRIGERATOR MAINTENANCE */}
                {appliance.typeId === 'refrigerator' && (
                  <>
                    {/* Water Filter */}
                    <div className="flex flex-col gap-4 p-5 bg-base/50 rounded-2xl border border-glass-border">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan/10 rounded-lg text-cyan"><Droplets className="w-5 h-5"/></div>
                          <span className="font-bold text-lg">Water Filter</span>
                        </div>
                        <Toggle checked={!!formData.hasWaterFilter} onChange={c => setFormData({...formData, hasWaterFilter: c})} />
                      </div>
                      {formData.hasWaterFilter && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border/50">
                          <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last Replaced</span>
                            <input type="date" value={formData.waterFilterLastChanged || ''} onChange={e => setFormData({...formData, waterFilterLastChanged: e.target.value})} className="bg-glass border border-glass-border rounded-lg px-3 py-2 text-white focus:border-cyan outline-none" />
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Replace By (6 mo)</span>
                            <div className="bg-cyan/10 border border-cyan/20 rounded-lg px-3 py-2 text-cyan font-bold flex items-center h-[42px]">
                              {calculateNextDate(formData.waterFilterLastChanged, 6)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Air Filter */}
                    <div className="flex flex-col gap-4 p-5 bg-base/50 rounded-2xl border border-glass-border">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400"><Wind className="w-5 h-5"/></div>
                          <span className="font-bold text-lg">Air Filter</span>
                        </div>
                        <Toggle checked={!!formData.hasAirFilter} onChange={c => setFormData({...formData, hasAirFilter: c})} />
                      </div>
                      {formData.hasAirFilter && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border/50">
                          <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last Replaced</span>
                            <input type="date" value={formData.airFilterLastChanged || ''} onChange={e => setFormData({...formData, airFilterLastChanged: e.target.value})} className="bg-glass border border-glass-border rounded-lg px-3 py-2 text-white focus:border-emerald-400 outline-none" />
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Replace By (6 mo)</span>
                            <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 text-emerald-400 font-bold flex items-center h-[42px]">
                              {calculateNextDate(formData.airFilterLastChanged, 6)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Condenser Cleaning */}
                    <div className="flex flex-col gap-4 p-5 bg-base/50 rounded-2xl border border-glass-border md:col-span-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400"><Sparkles className="w-5 h-5"/></div>
                        <span className="font-bold text-lg">Condenser Cleaning</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border/50">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last Cleaned</span>
                          <input type="date" value={formData.condenserLastCleaned || ''} onChange={e => setFormData({...formData, condenserLastCleaned: e.target.value})} className="bg-glass border border-glass-border rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none" />
                        </label>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Next Cleaning (12 mo)</span>
                          <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 text-amber-400 font-bold flex items-center h-[42px]">
                            {calculateNextDate(formData.condenserLastCleaned, 12)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* WASHER MAINTENANCE */}
                {appliance.typeId === 'washer' && (
                  <div className="flex flex-col gap-4 p-5 bg-base/50 rounded-2xl border border-glass-border md:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet/10 rounded-lg text-violet"><Droplets className="w-5 h-5"/></div>
                      <span className="font-bold text-lg">Drain Pump Filter</span>
                    </div>
                    <p className="text-sm text-gray-400">Regularly cleaning the drain pump filter prevents odors and drainage issues.</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border/50">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last Cleaned</span>
                        <input type="date" value={formData.drainPumpLastCleaned || ''} onChange={e => setFormData({...formData, drainPumpLastCleaned: e.target.value})} className="bg-glass border border-glass-border rounded-lg px-3 py-2 text-white focus:border-violet outline-none" />
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Next Cleaning (3 mo)</span>
                        <div className="bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 text-violet font-bold flex items-center h-[42px]">
                          {calculateNextDate(formData.drainPumpLastCleaned, 3)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DRYER MAINTENANCE */}
                {appliance.typeId === 'dryer' && (
                  <div className="flex flex-col gap-4 p-5 bg-base/50 rounded-2xl border border-glass-border md:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400"><Wind className="w-5 h-5"/></div>
                      <span className="font-bold text-lg">Lint Filter & Duct System</span>
                    </div>
                    <p className="text-sm text-gray-400">While the primary lint screen should be emptied after every load, the internal duct and housing require periodic deep cleaning to prevent fire hazards.</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border/50">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last Deep Cleaned</span>
                        <input type="date" value={formData.lintFilterLastCleaned || ''} onChange={e => setFormData({...formData, lintFilterLastCleaned: e.target.value})} className="bg-glass border border-glass-border rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none" />
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Next Deep Clean (6 mo)</span>
                        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 text-amber-400 font-bold flex items-center h-[42px]">
                          {calculateNextDate(formData.lintFilterLastCleaned, 6)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Diagnostic History Card */}
          <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3 border-b border-glass-border pb-4">
              <History className="w-7 h-7 text-violet" />
              Diagnostic History
            </h2>
            
            <div className="flex flex-col gap-4">
              {formData.diagnosticsHistory?.map((diag: any) => (
                <div 
                  key={diag.id} 
                  onClick={() => setSelectedDiagnostic(diag)}
                  className="p-5 rounded-2xl bg-base/50 border border-glass-border hover:border-violet/30 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-white group-hover:text-violet transition-colors">{diag.title}</h4>
                    <span className="text-sm text-gray-400">
                      {new Date(diag.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{diag.summary}</p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet/10 text-violet border border-violet/20 text-xs font-bold">
                      {diag.status}
                    </div>
                    <span className="text-xs text-gray-500">{diag.messages?.length || 0} messages</span>
                  </div>
                </div>
              ))}

              {(!formData.diagnosticsHistory || formData.diagnosticsHistory.length === 0) && (
                <div className="p-5 rounded-2xl bg-base/50 border border-glass-border hover:border-violet/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-white">System Scan</h4>
                    <span className="text-sm text-gray-400">March 10, 2024</span>
                  </div>
                  <p className="text-gray-300 text-lg mb-4">AI Diagnostic performed a routine check. All systems operating normally.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-sm font-bold">
                    Clear
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-base border border-glass-border rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">Delete Appliance?</h3>
              <p className="text-gray-400">This action cannot be undone. All photos, maintenance history, and details will be permanently removed.</p>
            </div>
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => onDelete(appliance.id)}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-lg"
              >
                Delete appliance
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3.5 bg-glass border border-glass-border text-white font-bold rounded-xl hover:bg-glass-border transition-colors text-lg"
              >
                Don't delete appliance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Report Modal */}
      {selectedDiagnostic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-base border border-glass-border rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-glass-border flex items-center justify-between bg-glass">
              <div>
                <h3 className="text-2xl font-display font-bold text-white">{selectedDiagnostic.title}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedDiagnostic.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button onClick={() => setSelectedDiagnostic(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-gradient-to-b from-base to-black/50">
              <div className="p-5 rounded-2xl bg-violet/10 border border-violet/20">
                <h4 className="font-bold text-violet mb-2">Diagnostic Summary</h4>
                <p className="text-gray-200 leading-relaxed">{selectedDiagnostic.summary}</p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-400" />
                  Conversation Transcript
                </h4>
                <div className="flex flex-col gap-4">
                  {selectedDiagnostic.messages?.map((msg: any, i: number) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-wider">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                        msg.role === 'user' 
                          ? 'bg-cyan text-black rounded-tr-sm' 
                          : 'bg-glass border border-glass-border text-gray-200 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {(!selectedDiagnostic.messages || selectedDiagnostic.messages.length === 0) && (
                    <p className="text-gray-500 italic">No transcript available for this session.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplianceView({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
  const [selectedApplianceId, setSelectedApplianceId] = useState<number | null>(null);
  
  // Initialize state from local storage to persist data
  const [myAppliances, setMyAppliances] = useState(() => {
    try {
      const saved = localStorage.getItem('homeiq_appliances');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse appliances from local storage", e);
    }
    // Default mock data if nothing is saved
    return [
      {
        id: 1,
        typeId: 'refrigerator',
        brand: 'Samsung',
        model: 'RF28R7351SR',
        serial: 'S/N 123456789',
        age: '3 years',
        status: 'Needs Attention',
        hasWaterFilter: true,
        waterFilterLastChanged: '2023-10-15',
        hasAirFilter: false,
        condenserLastCleaned: '2023-05-20',
        customImage: null,
        gallery: []
      },
      {
        id: 2,
        typeId: 'washer',
        brand: 'LG',
        model: 'WM3998HBA',
        serial: 'S/N 987654321',
        age: '1 year',
        status: 'Good',
        drainPumpLastCleaned: '2024-01-10',
        customImage: null,
        gallery: []
      }
    ];
  });

  // Save to local storage whenever appliances change
  useEffect(() => {
    localStorage.setItem('homeiq_appliances', JSON.stringify(myAppliances));
  }, [myAppliances]);

  // Listen for changes from other components (like the AI assistant)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('homeiq_appliances');
        if (saved) {
          setMyAppliances(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to parse appliances from local storage", e);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSave = (updatedAppliance: any) => {
    if (myAppliances.find((a: any) => a.id === updatedAppliance.id)) {
      setMyAppliances(myAppliances.map((a: any) => a.id === updatedAppliance.id ? updatedAppliance : a));
    } else {
      setMyAppliances([...myAppliances, updatedAppliance]);
    }
    setView('list');
  };

  const handleDelete = (id: number) => {
    setMyAppliances(myAppliances.filter((a: any) => a.id !== id));
    setView('list');
  };

  const handleAddType = (typeId: string) => {
    const newAppliance = {
      id: Date.now(),
      typeId,
      brand: '',
      model: '',
      serial: '',
      age: '',
      status: 'Good',
      hasWaterFilter: false,
      hasAirFilter: false,
      waterFilterLastChanged: '',
      airFilterLastChanged: '',
      condenserLastCleaned: '',
      drainPumpLastCleaned: '',
      lintFilterLastCleaned: '',
      customImage: null,
      gallery: []
    };
    setMyAppliances([...myAppliances, newAppliance]);
    setSelectedApplianceId(newAppliance.id);
    setView('detail');
  };

  if (view === 'detail' && selectedApplianceId) {
    const appliance = myAppliances.find((a: any) => a.id === selectedApplianceId);
    if (appliance) {
      return <ApplianceDetail appliance={appliance} onBack={() => setView('list')} onSave={handleSave} onDelete={handleDelete} />;
    }
  }

  if (view === 'add') {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-3 rounded-full bg-glass hover:bg-glass-border transition-colors">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Select Appliance Type</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {APPLIANCE_TYPES.map(type => (
            <button 
              key={type.id}
              onClick={() => handleAddType(type.id)}
              className="glass-card p-8 flex flex-col items-center justify-center gap-6 hover:border-cyan/50 hover:bg-glass-border transition-all duration-300 group"
            >
              <type.icon className={`w-32 h-32 ${type.color} group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_currentColor]`} />
              <span className="text-2xl font-display font-bold text-center">{type.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default: List View
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-full bg-glass hover:bg-glass-border transition-colors">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Your Appliances</h1>
        </div>
        <button 
          onClick={() => setView('add')}
          className="hidden md:flex items-center gap-2 px-6 py-4 bg-cyan text-black font-bold rounded-xl hover:bg-cyan/90 transition-colors shadow-[0_0_20px_rgba(0,245,255,0.4)] text-xl"
        >
          <Plus className="w-6 h-6" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myAppliances.map((app: any) => {
          const typeInfo = APPLIANCE_TYPES.find(t => t.id === app.typeId);
          const Icon = typeInfo?.icon || RefrigeratorIcon;
          
          return (
            <div 
              key={app.id} 
              onClick={() => { setSelectedApplianceId(app.id); setView('detail'); }}
              className="glass-card p-8 overflow-hidden group cursor-pointer hover:border-cyan/50 transition-colors flex flex-col items-center text-center gap-6 relative"
            >
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold absolute top-6 right-6 z-10 ${
                app.status === 'Good' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
              }`}>
                {app.status}
              </div>
              
              <div className="mt-8 mb-4 flex items-center justify-center w-40 h-40">
                {app.customImage ? (
                  <img 
                    src={app.customImage} 
                    alt={app.brand || typeInfo?.name} 
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-xl border border-glass-border"
                  />
                ) : (
                  <Icon className={`w-full h-full ${typeInfo?.color} group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_currentColor]`} />
                )}
              </div>
              
              <div className="flex flex-col items-center w-full">
                <h3 className="text-3xl font-display font-bold text-white leading-tight mb-2">
                  {app.brand ? `${app.brand} ${typeInfo?.name}` : `New ${typeInfo?.name}`}
                </h3>
                <p className="text-gray-400 text-xl">{app.model || 'Model not set'}</p>
              </div>
            </div>
          );
        })}
        
        {/* Mobile Add Button */}
        <button 
          onClick={() => setView('add')}
          className="md:hidden glass-card p-8 flex flex-col items-center justify-center gap-4 hover:border-cyan/50 transition-colors border-dashed border-2"
        >
          <div className="w-20 h-20 rounded-full bg-cyan/20 flex items-center justify-center text-cyan">
            <Plus className="w-10 h-10" />
          </div>
          <span className="text-2xl font-display font-bold text-cyan">Add Appliance</span>
        </button>
      </div>
    </div>
  );
}
