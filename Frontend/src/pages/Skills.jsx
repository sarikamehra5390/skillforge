import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";

import SkillCard from "../components/skills/SkillCard";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import GlassCard from "../components/common/GlassCard";
import Illustration from "../components/common/Illustration";

import useDashboardStore from "../store/useDashboardStore";

import { toast } from "sonner";

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [editingSkill, setEditingSkill] =
    useState(null);

  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [deletingSkillId, setDeletingSkillId] =
    useState(null);

  const createSkill = useDashboardStore(
    (state) => state.createSkill
  );

  const updateSkill = useDashboardStore(
    (state) => state.updateSkill
  );

  const deleteSkill = useDashboardStore(
    (state) => state.deleteSkill
  );

  // ---------------------------------------------------------
  // Fetch skills
  // ---------------------------------------------------------

  const fetchSkills = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.get("/skills");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setSkills(data);
    } catch (requestError) {
      console.error(
        "Failed to load skills:",
        requestError
      );

      toast.error(
        "Failed to connect to your mastery forge"
      );

      setError(
        "Could not load your mastery paths. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadSkills = async () => {
      setError(null);
      setLoading(true);

      try {
        const response = await api.get(
          "/skills"
        );

        if (!mounted) return;

        const data = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        setSkills(data);
      } catch (requestError) {
        if (!mounted) return;

        console.error(
          "Failed to load skills:",
          requestError
        );

        toast.error(
          "Failed to connect to your mastery forge"
        );

        setError(
          "Could not load your mastery paths. Please try again."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSkills();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------------------
  // Categories
  // ---------------------------------------------------------

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        skills
          .map((skill) =>
            String(skill?.category || "").trim()
          )
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [skills]);

  // ---------------------------------------------------------
  // Filtered skills
  // ---------------------------------------------------------

  const normalizedSearchTerm =
    searchTerm.trim().toLowerCase();

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const skillName = String(
        skill?.name || ""
      ).toLowerCase();

      const skillCategory = String(
        skill?.category || ""
      );

      const matchesSearch =
        skillName.includes(
          normalizedSearchTerm
        );

      const matchesCategory =
        categoryFilter === "All" ||
        skillCategory === categoryFilter;

      return (
        matchesSearch && matchesCategory
      );
    });
  }, [
    skills,
    normalizedSearchTerm,
    categoryFilter,
  ]);

  // ---------------------------------------------------------
  // Add Skill
  // ---------------------------------------------------------

  const handleAddSkill = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const name = newSkill.name.trim();
    const category =
      newSkill.category.trim();

    if (!name) {
      toast.error(
        "Please give your skill a name."
      );
      return;
    }

    if (!category) {
      toast.error(
        "Please choose a category."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createSkill({
        name,
        category,
      });

      toast.success(
        "A new path has been forged!",
        {
          icon: "✨",
        }
      );

      setIsAddModalOpen(false);

      setNewSkill({
        name: "",
        category: "",
      });

      await fetchSkills();
    } catch (requestError) {
      console.error(
        "Failed to create skill:",
        requestError
      );

      toast.error(
        requestError?.response?.data?.message ||
          "The forge is cooling down. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Open Edit Modal
  // ---------------------------------------------------------

  const handleEditSkill = (skill) => {
    if (!skill) return;

    setEditingSkill(skill);

    setEditForm({
      name: skill.name || "",
      category: skill.category || "",
    });

    setIsEditModalOpen(true);
  };

  // ---------------------------------------------------------
  // Save Edit
  // ---------------------------------------------------------

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (isSubmitting || !editingSkill) {
      return;
    }

    const name = editForm.name.trim();
    const category =
      editForm.category.trim();

    if (!name) {
      toast.error(
        "Please give your skill a name."
      );
      return;
    }

    if (!category) {
      toast.error(
        "Please choose a category."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSkill(editingSkill._id, {
        name,
        category,
      });

      toast.success(
        "Path refined successfully!",
        {
          icon: "✨",
        }
      );

      setIsEditModalOpen(false);
      setEditingSkill(null);

      setEditForm({
        name: "",
        category: "",
      });

      await fetchSkills();
    } catch (requestError) {
      console.error(
        "Failed to update skill:",
        requestError
      );

      toast.error(
        requestError?.response?.data?.message ||
          "Failed to refine path. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Delete Skill
  // ---------------------------------------------------------

  const handleDeleteSkill = async (id) => {
    if (!id || deletingSkillId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to release this skill path?"
    );

    if (!confirmed) return;

    setDeletingSkillId(id);

    try {
      await deleteSkill(id);

      toast.success("Path released");

      await fetchSkills();
    } catch (requestError) {
      console.error(
        "Failed to delete skill:",
        requestError
      );

      toast.error(
        requestError?.response?.data?.message ||
          "Failed to release path"
      );
    } finally {
      setDeletingSkillId(null);
    }
  };

  // ---------------------------------------------------------
  // Modal helpers
  // ---------------------------------------------------------

  const closeAddModal = useCallback(() => {
    if (isSubmitting) return;

    setIsAddModalOpen(false);

    setNewSkill({
      name: "",
      category: "",
    });
  }, [isSubmitting]);

  const closeEditModal = useCallback(() => {
    if (isSubmitting) return;

    setIsEditModalOpen(false);
    setEditingSkill(null);

    setEditForm({
      name: "",
      category: "",
    });
  }, [isSubmitting]);

  // ---------------------------------------------------------
  // Escape key
  // ---------------------------------------------------------

  useEffect(() => {
    if (
      !isAddModalOpen &&
      !isEditModalOpen
    ) {
      return;
    }

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        if (isAddModalOpen) {
          closeAddModal();
        }

        if (isEditModalOpen) {
          closeEditModal();
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isAddModalOpen,
    isEditModalOpen,
    isSubmitting,
    closeAddModal,
    closeEditModal,
  ]);

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            Your Mastery Paths
          </h1>

          <p className="text-slate-400 font-medium leading-relaxed">
            These are the seeds of your future
            expertise. Nurture them with consistent
            rituals and watch yourself transform.
          </p>
        </div>

        <Button
          type="button"
          onClick={() =>
            setIsAddModalOpen(true)
          }
          size="lg"
          className="rounded-2xl shadow-xl shadow-primary-500/10"
        >
          <Plus
            size={20}
            className="mr-2"
            aria-hidden="true"
          />
          Plant a New Seed
        </Button>
      </div>

      {/* Search & Filter */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 border-white/5 bg-white/[0.02]">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-400 transition-colors"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search your journey..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            aria-label="Search mastery paths"
            autoComplete="off"
            className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              aria-label="Filter skills by category"
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-5 pr-12 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all cursor-pointer"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-forge-950"
                >
                  {category}
                </option>
              ))}
            </select>

            <Filter
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </GlassCard>

      {/* Skills Grid */}
      {error ? (
        <GlassCard className="p-8 border-red-500/20 bg-red-500/5">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <AlertCircle
                size={32}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                Mastery Forge Unreachable
              </h3>

              <p className="text-slate-400">
                {error}
              </p>
            </div>

            <Button
              type="button"
              onClick={fetchSkills}
              variant="secondary"
              className="shrink-0"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className="mr-2"
                aria-hidden="true"
              />
              Retry
            </Button>
          </div>
        </GlassCard>
      ) : loading ? (
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-label="Loading mastery paths"
        >
          <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill?._id}
              skill={skill}
              onDelete={handleDeleteSkill}
              onEdit={() =>
                handleEditSkill(skill)
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center relative overflow-hidden rounded-[3rem] bg-forge-900/20 border border-white/5">
          <div className="relative w-80 h-80 mb-8">
            <Illustration
              name="growthTree"
              className="w-full h-full opacity-90"
            />
          </div>

          <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight">
            Your garden awaits seeds...
          </h3>

          <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
            {normalizedSearchTerm ||
            categoryFilter !== "All"
              ? "We couldn't find any branches matching your search. Try looking in a different part of the forest."
              : "Your mastery tree is ready to grow. Plant your first skill seed and watch it bloom into a strong branch."}
          </p>

          {!normalizedSearchTerm &&
            categoryFilter === "All" && (
              <Button
                type="button"
                className="mt-12 rounded-2xl px-12 py-5 shadow-2xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400 text-lg"
                onClick={() =>
                  setIsAddModalOpen(true)
                }
              >
                Plant Your First Seed
              </Button>
            )}

          {/* Ambient Glows */}
          <div
            className="absolute top-0 left-0 w-64 h-64 bg-warm-amber/5 rounded-full blur-[100px]"
            aria-hidden="true"
          />

          <div
            className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px]"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Add Skill Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-950/80 backdrop-blur-md animate-in fade-in duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-skill-title"
        >
          <GlassCard className="w-full max-w-md p-10 border-white/10 shadow-2xl rounded-[2.5rem]">
            <h2
              id="add-skill-title"
              className="text-3xl font-bold text-white mb-8 tracking-tight"
            >
              New Mastery Path
            </h2>

            <form
              onSubmit={handleAddSkill}
              className="space-y-8"
              noValidate
            >
              <Input
                label="What skill are you pursuing?"
                placeholder="e.g. Piano, Design, Cooking"
                value={newSkill.name}
                onChange={(event) =>
                  setNewSkill((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 p-4"
              />

              <Input
                label="Category"
                placeholder="e.g. Art, Tech, Wellness"
                value={newSkill.category}
                onChange={(event) =>
                  setNewSkill((previous) => ({
                    ...previous,
                    category:
                      event.target.value,
                  }))
                }
                required
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 p-4"
              />

              <div className="flex gap-4 mt-10">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-2xl py-4"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                >
                  Maybe later
                </Button>

                <Button
                  type="submit"
                  className="flex-1 rounded-2xl py-4 shadow-xl shadow-primary-500/20"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Forging..."
                    : "Forge Path"}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Edit Skill Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-950/80 backdrop-blur-md animate-in fade-in duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-skill-title"
        >
          <GlassCard className="w-full max-w-md p-10 border-white/10 shadow-2xl rounded-[2.5rem]">
            <h2
              id="edit-skill-title"
              className="text-3xl font-bold text-white mb-8 tracking-tight"
            >
              Refine Mastery Path
            </h2>

            <form
              onSubmit={handleSaveEdit}
              className="space-y-8"
              noValidate
            >
              <Input
                label="Skill Name"
                placeholder="e.g. Piano, Design, Cooking"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 p-4"
              />

              <Input
                label="Category"
                placeholder="e.g. Art, Tech, Wellness"
                value={editForm.category}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    category:
                      event.target.value,
                  }))
                }
                required
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 p-4"
              />

              <div className="flex gap-4 mt-10">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-2xl py-4"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 rounded-2xl py-4 shadow-xl shadow-primary-500/20"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Refining..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Skills;
