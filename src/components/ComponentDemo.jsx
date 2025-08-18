import React, { useState } from "react";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  FormTextarea,
  Button,
  Card,
  Modal,
  Dialog,
} from "./index";

const ComponentDemo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: "USER", label: "User" },
    { value: "SECURITY_GUARD", label: "Security Guard" },
    { value: "MANAGER", label: "Manager" },
  ];

  const handleInputChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.terms) {
      newErrors.terms = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "",
        message: "",
        terms: false,
      });
    }, 2000);
  };

  const handleDialogConfirm = () => {
    setShowDialog(false);
    // Handle confirmation logic here
    console.log("Dialog confirmed");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Enhanced UI Components Demo</h1>

      {/* Form Components Demo */}
      <Card
        header={<Card.Title>Enhanced Form Components</Card.Title>}
        padding="large"
        shadow="medium"
        className="mb-8"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row form-row--two-cols">
            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder="Enter your full name"
              error={errors.name}
              required
            />

            <FormInput
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="Enter your email"
              error={errors.email}
              required
            />
          </div>

          <FormSelect
            label="Role"
            value={formData.role}
            onChange={handleInputChange("role")}
            options={roleOptions}
            placeholder="Select your role"
            error={errors.role}
            required
          />

          <FormTextarea
            label="Message"
            value={formData.message}
            onChange={handleInputChange("message")}
            placeholder="Enter your message (optional)"
            rows={4}
          />

          <FormCheckbox
            label="I agree to the terms and conditions"
            checked={formData.terms}
            onChange={handleInputChange("terms")}
            error={errors.terms}
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDialog(true)}
            >
              Show Dialog
            </Button>
            <Button type="submit" variant="primary" loading={loading} icon="✓">
              Submit Form
            </Button>
          </div>
        </form>
      </Card>

      {/* Button Variants Demo */}
      <Card
        header={<Card.Title>Button Variants</Card.Title>}
        padding="large"
        shadow="medium"
        className="mb-8"
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Button icon="🚀" iconPosition="left">
            With Icon
          </Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      {/* Card Variants Demo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Card variant="default" padding="medium" hover>
          <Card.Title>Default Card</Card.Title>
          <Card.Description>
            This is a default card with hover effect. Click me!
          </Card.Description>
        </Card>

        <Card variant="elevated" padding="medium">
          <Card.Title>Elevated Card</Card.Title>
          <Card.Description>
            This card has more elevation and shadow.
          </Card.Description>
        </Card>

        <Card variant="outlined" padding="medium">
          <Card.Title>Outlined Card</Card.Title>
          <Card.Description>
            This card has a border instead of shadow.
          </Card.Description>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Form Submitted Successfully!"
        size="medium"
      >
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <p>Your form has been submitted successfully. Thank you!</p>
          <div style={{ marginTop: "2rem" }}>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleDialogConfirm}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This cannot be undone."
        variant="warning"
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ComponentDemo;
