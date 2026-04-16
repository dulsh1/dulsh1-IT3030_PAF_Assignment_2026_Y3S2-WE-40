import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Catalogue = () => {
    const { user } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' (horizontal) or 'grid' (vertical)
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [newRes, setNewRes] = useState({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' });
    const [resImage, setResImage] = useState(null);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const endpoint = typeFilter ? `/resources?type=${typeFilter}` : '/resources';
            const response = await api.get(endpoint);
            // Artificial delay to show premium skeleton loaders for 3 seconds
            setTimeout(() => {
                setResources(response.data);
                setLoading(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to fetch resources", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [typeFilter]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newRes.name);
            formData.append('type', newRes.type);
            formData.append('capacity', newRes.capacity);
            formData.append('location', newRes.location);
            formData.append('status', newRes.status);
            formData.append('startTime', newRes.startTime);
            formData.append('endTime', newRes.endTime);
            if (resImage) {
                formData.append('image', resImage);
            }

            if (isEditing) {
                await api.put(`/resources/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Facility updated successfully!');
            } else {
                await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Facility added successfully!');
            }

            setShowAddForm(false);
            setIsEditing(false);
            setEditId(null);
            setNewRes({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' });
            setResImage(null);
            fetchResources();
        } catch(err) { alert('Failed to save resource.'); }
    };

    const handleEditClick = (res) => {
        setIsEditing(true);
        setEditId(res.id);
        setNewRes({ name: res.name, type: res.type, capacity: res.capacity, location: res.location, status: res.status, startTime: res.startTime || '08:00', endTime: res.endTime || '18:00' });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id) => {
        if(window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await api.delete(`/resources/${id}`);
                fetchResources();
            } catch(e) { alert("Failed to delete resource"); }
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--text-main)' }}>Facilities & Assets Catalogue</h2>
            <p style={{ color: 'var(--text-muted)' }}>Browse and filter available university resources.</p>
            
            <div style={{ 
                margin: '20px 0', 
                padding: '20px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search resources..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-input"
                            style={{ padding: '8px 12px 8px 35px', width: '100%', fontSize: '14px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>Filter:</label>
                        <select 
                            value={typeFilter} 
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="premium-input"
                            style={{ padding: '8px 16px', width: '160px' }}
                        >
                            <option value="">All Categories</option>
                            <option value="LECTURE_HALL">Lecture Halls</option>
                            <option value="LAB">Laboratories</option>
                            <option value="MEETING_ROOM">Meeting Rooms</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button 
                        onClick={() => setViewMode('list')}
                        style={{ 
                            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                            background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}>
                        Horizontal
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        style={{ 
                            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                            background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}>
                        Grid
                    </button>
                </div>

                {user?.role === 'ROLE_ADMIN' && (
                    <button onClick={() => {
                        setShowAddForm(!showAddForm);
                        if(showAddForm) { setIsEditing(false); setEditId(null); setNewRes({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' }); }
                    }} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                        {showAddForm ? 'Cancel' : '+ New Facility'}
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="premium-card" style={{ padding: '40px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>
                            {isEditing ? '⚒️ Edit Resource' : '✨ Create New Resource'}
                        </h3>
                        <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                    </div>

                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                            <div>
                                <label className="form-label">Facility Name</label>
                                <input required placeholder="e.g. Lecture Hall A-101" value={newRes.name} 
                                    className="premium-input"
                                    onChange={e => setNewRes({...newRes, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <select value={newRes.type} className="premium-input"
                                        onChange={e => setNewRes({...newRes, type: e.target.value})}>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Laboratory</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div>
                                <label className="form-label">Location / Building</label>
                                <input required placeholder="e.g. New Building, 3rd Floor" value={newRes.location} 
                                    className="premium-input"
                                    onChange={e => setNewRes({...newRes, location: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Capacity (Pax)</label>
                                <input required type="number" value={newRes.capacity} 
                                    className="premium-input"
                                    onChange={e => setNewRes({...newRes, capacity: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="form-label">Operational Status</label>
                                <select value={newRes.status} className="premium-input"
                                        onChange={e => setNewRes({...newRes, status: e.target.value})}>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div>
                                <label className="form-label">Daily Available From</label>
                                <input required type="time" value={newRes.startTime} 
                                    className="premium-input"
                                    onChange={e => setNewRes({...newRes, startTime: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Daily Available Until</label>
                                <input required type="time" value={newRes.endTime} 
                                    className="premium-input"
                                    onChange={e => setNewRes({...newRes, endTime: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Featured Image</label>
                                <input type="file" accept="image/*" 
                                    onChange={e => setResImage(e.target.files[0])} 
                                    className="premium-input"
                                    style={{ padding: '8px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button type="submit" style={{ 
                                flex: 2, padding: '16px', background: 'var(--primary)', color: 'white', 
                                border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', 
                                fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s'
                            }}>
                                {isEditing ? 'Update Resource Details' : 'Publish New Resource'}
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} style={{ 
                                flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', 
                                border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', 
                                fontWeight: '700' 
                            }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', 
                    gap: '20px' 
                }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="premium-card" style={{ 
                            display: 'flex', 
                            flexDirection: viewMode === 'grid' ? 'column' : 'row', 
                            gap: '20px', 
                            padding: '16px', 
                            minHeight: viewMode === 'grid' ? '300px' : '200px' 
                        }}>
                            <div className="skeleton" style={{ flex: viewMode === 'grid' ? '0 0 160px' : '0 0 180px', height: viewMode === 'grid' ? '160px' : '168px', borderRadius: '12px' }}></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '15px' }}></div>
                                <div className="skeleton" style={{ width: '90%', height: '40px', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '36px', marginTop: '15px', borderRadius: '10px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', 
                    gap: '24px' 
                }}>
                    {resources.filter(res => {
                        const matchesType = typeFilter === '' || res.type === typeFilter;
                        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              res.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                              res.type.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesType && matchesSearch;
                    }).map(res => (
                        <div key={res.id} className="premium-card" style={{
                            display: 'flex',
                            flexDirection: viewMode === 'grid' ? 'column' : 'row',
                            gap: '20px',
                            padding: '16px',
                            minHeight: viewMode === 'grid' ? '380px' : '200px',
                            alignItems: 'stretch',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {res.image && (
                                <div style={{ 
                                    flex: viewMode === 'grid' ? '0 0 160px' : '0 0 180px', 
                                    height: viewMode === 'grid' ? '160px' : 'auto', 
                                    overflow: 'hidden', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    position: 'relative'
                                }}>
                                    <img src={`data:${res.imageContentType};base64,${res.image}`} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="zoom-hover" />
                                    {viewMode === 'grid' && (
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            backgroundColor: res.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.9)' : res.status === 'INACTIVE' ? 'rgba(148, 163, 184, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                            color: 'white',
                                            padding: '4px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase',
                                            backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}>
                                            {res.status === 'ACTIVE' ? 'AVAILABLE' : res.status.replace('_', ' ')}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ margin: '0', color: 'var(--text-main)', fontSize: viewMode === 'grid' ? '18px' : '20px', letterSpacing: '-0.5px' }}>{res.name}</h3>
                                        {viewMode === 'list' && (
                                            <span style={{
                                                backgroundColor: res.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : res.status === 'INACTIVE' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: res.status === 'ACTIVE' ? '#10b981' : res.status === 'INACTIVE' ? '#94a3b8' : '#ef4444',
                                                border: `1px solid rgba(255,255,255,0.05)`,
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'
                                            }}>
                                                {res.status === 'ACTIVE' ? 'AVAILABLE' : res.status.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: viewMode === 'grid' ? '1fr' : '1fr 1fr', 
                                        gap: viewMode === 'grid' ? '6px' : '8px 20px', 
                                        marginBottom: '15px' 
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <span style={{opacity: 0.6}}>Type:</span> {res.type.replace('_', ' ')}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <span style={{opacity: 0.6}}>Capacity:</span> {res.capacity} pax
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <span style={{opacity: 0.6}}>Location:</span> {res.location}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <span style={{opacity: 0.6}}>Hours:</span> {res.startTime || '08:00'} - {res.endTime || '18:00'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                    {user?.role === 'ROLE_USER' && res.status === 'ACTIVE' && (
                                        <>
                                            <button onClick={() => window.location.href=`/book/${res.id}`} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Book Now</button>
                                            <button onClick={() => window.location.href=`/report/${res.id}`} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Report</button>
                                        </>
                                    )}

                                    {user?.role === 'ROLE_ADMIN' && (
                                        <>
                                            <button onClick={() => handleEditClick(res)} style={{ flex: 1, padding: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteClick(res.id)} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', paddingTop: '40px' }}>No resources match your filters.</p>}
                </div>
            )}
        </div>
    );
};

export default Catalogue;
