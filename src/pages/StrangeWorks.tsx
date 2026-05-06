/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Github, FileText, ExternalLink, Hash } from "lucide-react";
import { Project } from "../types";

const CATEGORIES = {
  "Quantum AI": ["Papers", "Projects", "Documentation"],
  "Large sequential Models": ["Papers", "Projects", "Documentation"],
  "Android": ["Papers", "Projects", "Documentation"],
  "Thermodynamic Computing": ["Papers", "Projects", "Documentation"]
};

export default function StrangeWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Quantum AI");
  const [activeSubCategory, setActiveSubCategory] = useState("Optimization");

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    imageUrl: "https://picsum.photos/seed/" + Math.random() + "/800/600",
    githubUrl: "https://github.com/r-karra",
    paperUrl: "#",
    projectUrl: "#",
    tags: "",
    category: "Quantum AI",
    subCategory: "Papers",
    fileNumber: "",
    dataUrl: "",
    docUrl: ""
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const [dbStatus, setDbStatus] = useState<{status: string, mode: string} | null>(null);

  const fetchProjects = async () => {
    try {
      console.log("[StrangeWorks] Fetching projects...");
      const res = await fetch("/api/projects?t=" + Date.now());
      const contentType = res.headers.get("content-type");
      
      const text = await res.text();
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("[StrangeWorks] JSON parse error:", e);
          throw new Error("Malformed JSON response from archives");
        }
      } else {
        console.error("[StrangeWorks] Expected JSON but got HTTP " + res.status + " with content-type:", contentType);
        console.error("[StrangeWorks] Body preview:", text.substring(0, 300));
        throw new Error(`Server returned non-JSON response (${contentType || 'unknown type'})`);
      }
      
      if (res.ok) {
        setProjects(data);
      } else {
        console.error("[StrangeWorks] Fetch failed:", data.error || res.statusText);
      }
      
      // Also fetch DB status
      try {
        const statusRes = await fetch("/api/test-db?t=" + Date.now());
        if (statusRes.ok) {
          const statusVal = await statusRes.json();
          setDbStatus(statusVal);
        }
      } catch (e) {
        console.warn("[StrangeWorks] Could not fetch DB status");
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      // alert(`Sync Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const storedKey = localStorage.getItem("adminKey");
    if (storedKey) {
      setAdminKey(storedKey);
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const key = prompt("Enter Admin Secret Key (Default is 'eth::aei'):");
    if (key === "eth::aei") {
      setAdminKey(key);
      setIsAdmin(true);
      localStorage.setItem("adminKey", key);
      window.location.reload(); 
    } else if (key !== null) {
      alert("Invalid Key. If you haven't changed it, try 'eth::aei'");
    }
  };

  // Alternative inline login state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState("");

  const executeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim()) {
      setAdminKey(loginInput.trim());
      setIsAdmin(true);
      localStorage.setItem("adminKey", loginInput.trim());
      setShowLoginModal(false);
      setLoginInput("");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminKey");
    setIsAdmin(false);
    setAdminKey("");
    window.location.reload();
  };

  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setNewProject({
      title: "",
      description: "",
      imageUrl: "https://picsum.photos/seed/" + Math.random() + "/800/600",
      githubUrl: "https://github.com/r-karra",
      paperUrl: "#",
      projectUrl: "#",
      tags: "",
      category: "Quantum AI",
      subCategory: "Papers",
      fileNumber: "",
      dataUrl: "",
      docUrl: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const currentKey = adminKey || localStorage.getItem("adminKey") || "";
      
      const payload = {
        title: newProject.title,
        description: newProject.description,
        imageUrl: newProject.imageUrl,
        githubUrl: newProject.githubUrl,
        paperUrl: newProject.paperUrl,
        projectUrl: newProject.projectUrl,
        tags: newProject.tags.split(",").filter(t => t.trim() !== "").map(t => t.trim()),
        category: newProject.category,
        subCategory: newProject.subCategory,
        fileNumber: newProject.fileNumber,
        dataUrl: newProject.dataUrl,
        docUrl: newProject.docUrl
      };

      const endpoint = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": currentKey
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        responseData = { error: "Server returned non-JSON response: " + responseText.slice(0, 50) + "..." };
      }

      if (response.ok) {
        alert(editingId ? "Success: Record updated." : "Success: Research project committed to the archives.");
        resetForm();
        await fetchProjects();
      } else {
        if (response.status === 401) {
          alert("Unauthorized: The Admin Secret Key was rejected. Logged out for security.");
          logout();
        } else {
          alert(`Commit Failed: ${responseData.error || response.statusText}`);
        }
      }
    } catch (error: any) {
      console.error("[StrangeWorks] Commit exception:", error);
      alert(`Connection Error: ${error.message || "Could not reach archives"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const currentKey = adminKey || localStorage.getItem("adminKey") || "";
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": currentKey }
      });
      if (response.ok) {
        alert("Record deleted.");
        fetchProjects();
      } else {
        alert("Failed to delete record.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting record.");
    }
  };

  const handleEdit = (p: Project) => {
    setEditingId(p.id);
    setNewProject({
      title: p.title || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      githubUrl: p.githubUrl || "",
      paperUrl: p.paperUrl || "",
      projectUrl: p.projectUrl || "",
      tags: p.tags ? p.tags.join(", ") : "",
      category: p.category || "Thermodynamic Computing",
      subCategory: p.subCategory || "Projects",
      fileNumber: p.fileNumber || "",
      dataUrl: p.dataUrl || "",
      docUrl: p.docUrl || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 flex justify-center">
        <div className="animate-pulse text-gray-400 font-medium tracking-widest uppercase text-xs text-center mt-20">
          Syncing strange archives...
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-8 lg:px-20">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-[10px] font-black tracking-[0.4em] text-neutral-300 uppercase block mb-6">
              |ketAI&gt; / Archives
            </span>
            <h1 className="text-6xl lg:text-8xl font-black text-neutral-900 tracking-tighter mb-8 italic uppercase">
              Strange Works.
            </h1>
            <p className="text-neutral-500 text-xl leading-relaxed font-medium">
              A continuous series of technical benchmarks, research experiments, and software prototypes focused on artificial intelligence and distributed systems.
            </p>
            {dbStatus ? (
              <div className="mt-8 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dbStatus.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  {dbStatus.mode} ARCHIVE: {dbStatus.status}
                </span>
              </div>
            ) : (
              <div className="mt-8 flex items-center gap-2 opacity-50">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  SYNCING ARCHIVE METRICS...
                </span>
              </div>
            )}
          </motion.div>

          <div className="flex flex-col items-end gap-4 min-w-[200px]">
            <button 
              onClick={isAdmin ? () => setShowAddForm(!showAddForm) : () => setShowLoginModal(!showLoginModal)}
              className="shrink-0 bg-neutral-900 text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all w-full"
            >
              {!isAdmin ? "ADMIN LOGIN" : showAddForm ? "CLOSE ARCHIVE" : "MANAGE RECORDS"}
            </button>
            
            {showLoginModal && !isAdmin && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={executeLogin}
                className="w-full flex gap-2"
              >
                <input 
                  type="password"
                  placeholder="KEY"
                  className="bg-white border border-neutral-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:border-neutral-900 outline-none w-full"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                />
                <button type="submit" className="bg-neutral-900 text-white px-4 py-2 text-[10px] font-black uppercase">GO</button>
              </motion.form>
            )}
          </div>
        </div>

        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-32 bg-neutral-50 p-12 border border-neutral-100"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Title</label>
                  <input 
                    required
                    className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Description</label>
                  <textarea 
                    required
                    className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium h-32"
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Category</label>
                    <select 
                      className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                      value={newProject.category}
                      onChange={e => {
                        const newCat = e.target.value as keyof typeof CATEGORIES;
                        setNewProject({...newProject, category: newCat, subCategory: CATEGORIES[newCat][0]});
                      }}
                    >
                      {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Sub Category</label>
                    <select 
                      className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                      value={newProject.subCategory}
                      onChange={e => setNewProject({...newProject, subCategory: e.target.value})}
                    >
                      {(CATEGORIES[newProject.category as keyof typeof CATEGORIES] || ["Projects"]).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {newProject.subCategory === "Projects" && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Image URL</label>
                      <input 
                        className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                        placeholder="https://..."
                        value={newProject.imageUrl}
                        onChange={e => setNewProject({...newProject, imageUrl: e.target.value})}
                      />
                    </div>
                  )}
                  <div className={newProject.subCategory !== "Projects" ? "col-span-2" : ""}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">GitHub / Repo URL</label>
                    <input 
                      className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                      value={newProject.githubUrl}
                      onChange={e => setNewProject({...newProject, githubUrl: e.target.value})}
                    />
                  </div>
                </div>

                {newProject.subCategory === "Papers" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Internal File Number</label>
                      <input 
                        className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                        placeholder="e.g. ARXIV-2401"
                        value={newProject.fileNumber}
                        onChange={e => setNewProject({...newProject, fileNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Data URL</label>
                      <input 
                        className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                        placeholder="Dataset Link..."
                        value={newProject.dataUrl}
                        onChange={e => setNewProject({...newProject, dataUrl: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">PDF URL</label>
                      <input 
                        className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                        placeholder="https://.../paper.pdf"
                        value={newProject.paperUrl}
                        onChange={e => setNewProject({...newProject, paperUrl: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {newProject.subCategory === "Projects" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Deploy / Live URL</label>
                      <input 
                        className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                        placeholder="https://..."
                        value={newProject.projectUrl}
                        onChange={e => setNewProject({...newProject, projectUrl: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {newProject.subCategory === "Documentation" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Documentation Details / Source Link</label>
                      <input 
                        className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                        placeholder="https://docs..."
                        value={newProject.docUrl}
                        onChange={e => setNewProject({...newProject, docUrl: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Tags (comma separated)</label>
                  <input 
                    className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-neutral-900 transition-all font-medium"
                    placeholder="AI, ML, Research"
                    value={newProject.tags}
                    onChange={e => setNewProject({...newProject, tags: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={submitting}
                  className={`w-full bg-neutral-900 text-white p-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? "COMMITTING..." : (editingId ? "UPDATE RECORD" : "COMMIT TO DATABASE")}
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="w-full bg-neutral-200 text-neutral-900 p-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-300 transition-all mt-2"
                  >
                    CANCEL EDIT
                  </button>
                )}
              </div>
            </form>

            <div className="mt-16 overflow-x-auto">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Existing Records</h3>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-3 px-4 font-medium">ID</th>
                    <th className="py-3 px-4 font-medium">Title</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Sub Category</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-white">
                      <td className="py-3 px-4 font-mono text-xs">{p.id}</td>
                      <td className="py-3 px-4 truncate max-w-[200px]">{p.title}</td>
                      <td className="py-3 px-4">{p.category}</td>
                      <td className="py-3 px-4">{p.subCategory}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-4 text-xs font-semibold">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-16 border-b border-neutral-200">
          <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar">
            {Object.keys(CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveSubCategory(CATEGORIES[cat as keyof typeof CATEGORIES][0]);
                }}
                className={`text-[12px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'text-neutral-900 border-b-2 border-neutral-900 pb-2' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {CATEGORIES[activeCategory as keyof typeof CATEGORIES]?.length > 1 && (
          <div className="mb-16 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES[activeCategory as keyof typeof CATEGORIES].map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubCategory(sub)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeSubCategory === sub ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {(() => {
          const catDescMap: any = {
            "Quantum AI": "Optimization, QLLMs, PDEs, QML, Hamiltonian and others that quantum computing can solve.",
            "Large sequential Models": "paLM, Quantum Particle transformer(Q-ParT) and others that can be dealt with LSMs.",
            "Android": "Innovative apps to access and integrate my research for user accessible AI for human and scientific discovery.",
            "Thermodynamic Computing": "Projects and research related to thermodynamic algorithms, THRML, and probabilistic graphical models."
          };
          const categoryDesc = catDescMap[activeCategory];

          const catProjects = projects.filter(p => p.category === activeCategory && p.subCategory === activeSubCategory);

          return (
            <div className="mb-32">
              <div className="mb-16 pb-4">
                <h2 className="text-3xl lg:text-4xl font-black text-neutral-900 tracking-tighter uppercase italic">{activeSubCategory}</h2>
                {categoryDesc && <p className="text-neutral-500 mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-4xl">{categoryDesc}</p>}
              </div>

              {catProjects.length === 0 ? (
                <div className="py-20 text-center text-neutral-400 font-bold uppercase tracking-widest text-xs border border-dashed border-neutral-200">
                  No projects committed to this archive yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-24 gap-x-12">
                  {catProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="group flex flex-col"
                    >
                      {project.subCategory === "Projects" && project.imageUrl && project.imageUrl !== "#" && (
                        <div className="aspect-[16/10] bg-neutral-100 overflow-hidden mb-8 border border-neutral-100">
                          <img 
                            src={project.imageUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover grayscale brightness-110 group-hover:scale-105 transition-transform duration-1000 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          {project.subCategory === "Papers" && project.fileNumber && (
                            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">{project.fileNumber}</span>
                          )}
                          <h3 className="text-3xl font-black tracking-tight text-neutral-900 leading-none">
                            {project.title}
                          </h3>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end max-w-[50%]">
                          {(project.tags || []).slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-neutral-900 text-[9px] font-black uppercase text-white tracking-widest leading-none">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-neutral-500 text-base leading-relaxed mb-10 font-medium line-clamp-3">
                        {project.description}
                      </p>

                      <div className="mt-auto flex gap-8 items-center border-t border-neutral-100 pt-8 flex-wrap">
                        {project.githubUrl && project.githubUrl !== "#" && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
                          >
                            <Github className="w-3 h-3" /> REPO
                          </a>
                        )}
                        {(project.subCategory === "Papers" || project.paperUrl !== "#") && project.paperUrl && (
                          <a 
                            href={project.paperUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-3 h-3" /> PDF
                          </a>
                        )}
                        {project.subCategory === "Papers" && project.dataUrl && project.dataUrl !== "#" && (
                          <a 
                            href={project.dataUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
                          >
                            <Hash className="w-3 h-3" /> DATA
                          </a>
                        )}
                        {project.subCategory === "Projects" && project.projectUrl && project.projectUrl !== "#" && (
                          <a 
                            href={project.projectUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink className="w-3 h-3" /> LIVE
                          </a>
                        )}
                        {project.subCategory === "Documentation" && project.docUrl && project.docUrl !== "#" && (
                          <a 
                            href={project.docUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-3 h-3" /> DOCS
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
