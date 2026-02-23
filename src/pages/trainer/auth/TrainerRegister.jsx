import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./TrainerAuth.css"
import { supabase } from "../../../services/supabase"





const TrainerRegister = () => {

    const navigate = useNavigate()



    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        password: "",
        branch: "",
        course: "",
        batches: []
    })
    const [batches, setBatches] = useState([])
    const [branches, setBranches] = useState([])
    const [courses, setCourses] = useState([])
    const fetchBatches = async () => {
        const { data, error } = await supabase
            .from("batches")
            .select("*")

        if (!error) {
            setBatches(data)

            const uniqueBranches = [
                ...new Set(data.map(b => b.branch))
            ]

            setBranches(uniqueBranches)
        }
    }

    useEffect(() => {
        fetchBatches()
    }, [])
    useEffect(() => {
        if (!formData.branch) return

        const filteredCourses = [
            ...new Set(
                batches
                    .filter(b => b.branch === formData.branch)
                    .map(b => b.course)
            )
        ]

        setCourses(filteredCourses)
    }, [formData.branch, batches])

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name === "branch") {
            setCourses([]) // ⭐ ADD THIS

            setFormData({
                ...formData,
                branch: value,
                course: "",
                batches: []
            })
        } else if (name === "course") {
            setFormData({
                ...formData,
                course: value,
                batches: []
            })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }


    const handleBatchChange = (e) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            batches: prev.batches.includes(value)
                ? prev.batches.filter((b) => b !== value)
                : [...prev.batches, value]
        }))
    }


    const resetForm = () => {
        setFormData({
            name: "",
            mobile: "",
            email: "",
            password: "",
            branch: "",
            course: "",
            batches: []
        })

        setCourses([])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 1️⃣ CREATE AUTH USER
        const { data: authData, error: authError } =
            await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            })

        if (authError) {
            alert(authError.message)
            return
        }

        const userId = authData.user.id // 🔥 THIS IS IMPORTANT

        // 2️⃣ INSERT TRAINER (id = auth.uid)
        const { data: trainer, error: trainerError } = await supabase
            .from("trainers")
            .insert([
                {
                    user_id: userId,
                    name: formData.name,
                    mobile: formData.mobile,
                    email: formData.email,
                    branch: formData.branch,
                    course: formData.course,
                    status: "Pending"   // ⭐ IMPORTANT
                }
            ])
            .select()
            .single()

        if (trainerError) {
            alert(trainerError.message)
            return
        }

        // 3️⃣ INSERT TRAINER BATCHES
        if (formData.batches.length > 0) {
            const batchRows = formData.batches.map((batch) => ({
                trainer_id: userId,
                batch_name: batch,
            }))

            const { error: batchError } = await supabase
                .from("trainer_batches")
                .insert(batchRows)

            if (batchError) {
                alert(batchError.message)
                return
            }
        }

        // 4️⃣ LOGIN SUCCESS
        localStorage.setItem("trainerToken", userId)
        // 4️⃣ SUCCESS
        resetForm()
       alert("Registration submitted. Wait for admin approval.")


    }

    const availableBatches = batches.filter(
        b =>
            b.branch === formData.branch &&
            b.course === formData.course
    )


    return (
        <div className="trainer-auth-container">
            <div className="trainer-auth-card">
                <h2>Trainer Registration</h2>
                <p>Create your trainer account</p>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="tel"
                        name="mobile"
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Branch</option>

                        {branches.map(branch => (
                            <option key={branch} value={branch}>
                                {branch}
                            </option>
                        ))}
                    </select>

                    {/* Course */}
                    {formData.branch && (
                        <select
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Course</option>

                            {courses.map(course => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Batches */}
                    {formData.course && (
                        <div className="checkbox-group">
                            <p>Available Batches ({availableBatches.length})</p>

                            {availableBatches.map(batch => (
                                <label key={batch.id}>
                                    <input
                                        type="checkbox"
                                        value={batch.name}
                                        onChange={handleBatchChange}
                                    />
                                    {batch.name}
                                </label>
                            ))}
                        </div>
                    )}


                    <button type="submit">Register</button>
                </form>

                <p className="auth-link">
                    Already registered? <Link to="/trainer/login">Login</Link>
                </p>
            </div>
        </div>
    )
}

export default TrainerRegister
