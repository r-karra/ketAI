/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Github, Code2, BrainCircuit, Atom, Mail, Linkedin, Notebook as HP, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const skills = [
    { name: "Quantum Machine Learning", icon: Atom },
    { name: "Sequential Models", icon: BrainCircuit },
    { name: "Functional AI (JAX)", icon: Code2 },
    { name: "Hardware Acceleration", icon: HP }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="px-8 lg:px-24 py-20 border-b border-neutral-100 bg-white">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="max-w-[1440px] mx-auto"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
            <div>
              <span className="text-[10px] font-black tracking-[0.4em] text-neutral-300 uppercase block mb-6">
                |ketAI&gt; / Research
              </span>
              <h1 className="text-[72px] lg:text-[140px] leading-[0.8] font-black tracking-tighter text-neutral-900 mb-8">
                QUANTUM<br/>INTELLIGENCE.
              </h1>
            </div>
            <div className="max-w-md pb-4">
              <p className="text-xl text-neutral-900 leading-relaxed font-medium italic border-l-4 border-neutral-900 pl-8">
                "To push the boundaries of classical computation by developing scalable, quantum-inspired algorithms and intelligent systems, contributing to the foundations of Quantum AI."
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-neutral-50">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
               <MapPin className="w-3 h-3" /> Hyderabad, India
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
               <Mail className="w-3 h-3" /> rajeshkarra.ai@gmail.com
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
               <Phone className="w-3 h-3" /> +91 888(681)-4149
             </div>
          </div>
        </motion.div>
      </section>

      {/* Main Content Grid */}
      <section className="px-8 lg:px-24 py-24 bg-neutral-50">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Left Column: Career & Research */}
          <div className="lg:col-span-7 space-y-24">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 mb-12">Career Summary</h2>
              <p className="text-2xl text-neutral-900 leading-relaxed font-medium">
                Research-focused Computer Science graduate and Quantum AI Researcher specializing in the intersection of Large Sequential Models and Quantum Computing. Mastering the Google DeepMind JAX ecosystem to develop hardware-accelerated AI systems for scientific discovery.
              </p>
            </div>

            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 mb-12">Research Initiatives</h2>
              <div className="space-y-12">
                <div className="bg-white p-10 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-4">Current / ML4Sci</span>
                  <h3 className="text-2xl font-black mb-4">Quantum Particle Transformer</h3>
                  <p className="text-neutral-500 mb-6 font-medium">Developing hybrid variational circuits to classify quark-gluon jets using JAX + PennyLane for Q-ParT architecture.</p>
                  <ul className="text-xs font-bold text-neutral-900 space-y-2 uppercase tracking-widest">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-neutral-900" /> Quantum Attention Mechanisms</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-neutral-900" /> GPU-Accelerated Backends</li>
                  </ul>
                </div>

                <div className="bg-white p-10 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-4">Google Research Foundations</span>
                  <h3 className="text-2xl font-black mb-4">Advanced Research Training</h3>
                  <p className="text-neutral-500 mb-6 font-medium">Porting SOTA Transformer architectures to JAX to leverage pure functional programming for research scalability.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tech Stack & Education */}
          <div className="lg:col-span-5 space-y-24">
            <div className="bg-neutral-900 text-white p-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-10">Technical Focus</h2>
              <div className="space-y-10">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-400">Quantum Stack</h4>
                  <p className="text-lg font-medium">Cirq, Qiskit, PennyLane, QAOA, VQE, QUBO Formulation</p>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-400">AI Frameworks</h4>
                  <p className="text-lg font-medium">JAX, Flax, Optax, XLA, Transformers, LLM Fine-tuning</p>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-neutral-400">Software</h4>
                  <p className="text-lg font-medium">Kotlin, Jetpack Compose, Linux (Crostini)</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300 mb-10">Academic Background</h2>
              <div className="border-l-2 border-neutral-200 pl-8 space-y-8">
                <div>
                  <h3 className="text-xl font-black italic underline decoration-neutral-100 underline-offset-8">Osmania University</h3>
                  <p className="text-sm text-neutral-500 mt-4 font-bold uppercase tracking-widest">B.Sc. Computer Science / 2021 — 2024</p>
                  <p className="text-neutral-900 mt-2 font-medium">Graduated with 7.87 CGPA. Thesis: Quantum TSP for Autonomous Drones.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <a href="https://github.com/r-karra" target="_blank" rel="noreferrer" className="flex justify-between items-center bg-white border border-neutral-200 p-6 hover:border-neutral-900 transition-all group">
                <span className="text-xs font-black uppercase tracking-widest">Connect on GitHub</span>
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <Link to="/strange-works" className="flex justify-between items-center bg-neutral-900 text-white p-6 hover:bg-neutral-800 transition-all group">
                <span className="text-xs font-black uppercase tracking-widest">Archives / Strange Works</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
