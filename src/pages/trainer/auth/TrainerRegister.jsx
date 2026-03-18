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
        password: ""
    })
    const [systemMessage, setSystemMessage] = useState("")



    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const resetForm = () => {
        setFormData({
            name: "",
            mobile: "",
            email: "",
            password: "",

        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        // CREATE AUTH USER
        const { data: authData, error: authError } =
            await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            })

        if (authError) {
            alert(authError.message)
            return
        }

        const userId = authData.user.id

        // INSERT TRAINER
        const { error: trainerError } = await supabase
            .from("trainers")
            .insert([
                {
                    user_id: userId,
                    name: formData.name,
                    mobile: formData.mobile,
                    email: formData.email,

                    status: "Pending"
                }
            ])

        if (trainerError) {
            alert(trainerError.message)
            return
        }

        await supabase.from("notifications").insert([
            {
                message: `🆕 New trainer registration request from ${formData.name}`
            }
        ])

        resetForm()

        setSystemMessage("Registration successful. Redirecting to login...")

        setTimeout(() => {
            navigate("/trainer/login")
        }, 1500)
    }

    return (
        <div className="trainer-auth-container">
            {systemMessage && (
                <div className="system-message">
                    {systemMessage}
                </div>
            )}
            <div className="trainer-auth-card">
                <h2>Trainer Registration</h2>
                <p>Create your trainer account</p>

                <form onSubmit={handleSubmit} autoComplete="off">

                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                    />

                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />



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