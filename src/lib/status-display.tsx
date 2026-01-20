/**
 * Status Display Utility
 * 
 * Provides role-aware status labels and styling.
 * Key principle: Whoever needs to act sees "Action Required" in yellow.
 * Whoever is waiting sees neutral styling with "Awaiting..."
 */

export type UserRole = "host" | "creator"

export interface StatusDisplay {
  label: string
  description: string
  color: string        // Tailwind bg color class
  textColor: string    // Tailwind text color class
  actionRequired: boolean
}

// =============================================================================
// OFFER STATUSES
// =============================================================================

export function getOfferStatusDisplay(
  status: string,
  role: UserRole
): StatusDisplay {
  const configs: Record<string, Record<UserRole, StatusDisplay>> = {
    pending: {
      host: {
        label: "Awaiting Response",
        description: "Waiting for the creator to respond to your offer.",
        color: "bg-gray-100",
        textColor: "text-gray-700",
        actionRequired: false,
      },
      creator: {
        label: "New Offer",
        description: "You have a new offer to review.",
        color: "bg-[#FFD84A]",
        textColor: "text-black",
        actionRequired: true,
      },
    },
    countered: {
      host: {
        label: "Counter Received",
        description: "The creator has proposed different terms.",
        color: "bg-[#FFD84A]",
        textColor: "text-black",
        actionRequired: true,
      },
      creator: {
        label: "Counter Sent",
        description: "Waiting for the host to respond to your counter.",
        color: "bg-gray-100",
        textColor: "text-gray-700",
        actionRequired: false,
      },
    },
    accepted: {
      host: {
        label: "Accepted",
        description: "The creator accepted! Collaboration is being set up.",
        color: "bg-[#28D17C]",
        textColor: "text-black",
        actionRequired: false,
      },
      creator: {
        label: "Accepted",
        description: "You accepted this offer. Collaboration is being set up.",
        color: "bg-[#28D17C]",
        textColor: "text-black",
        actionRequired: false,
      },
    },
    declined: {
      host: {
        label: "Declined",
        description: "The creator declined this offer.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
      creator: {
        label: "Declined",
        description: "You declined this offer.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
    },
    expired: {
      host: {
        label: "Expired",
        description: "This offer expired without a response.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
      creator: {
        label: "Expired",
        description: "This offer has expired.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
    },
    withdrawn: {
      host: {
        label: "Withdrawn",
        description: "You withdrew this offer.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
      creator: {
        label: "Withdrawn",
        description: "The host withdrew this offer.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
    },
  }

  const roleConfig = configs[status]?.[role]
  
  // Fallback for unknown status
  if (!roleConfig) {
    return {
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " "),
      description: "",
      color: "bg-gray-100",
      textColor: "text-gray-700",
      actionRequired: false,
    }
  }

  return roleConfig
}

// =============================================================================
// COLLABORATION STATUSES
// =============================================================================

export function getCollaborationStatusDisplay(
  status: string,
  role: UserRole,
  context?: {
    hasUserSigned?: boolean
    isFullyExecuted?: boolean
  }
): StatusDisplay {
  const { hasUserSigned = false, isFullyExecuted = false } = context || {}

  const configs: Record<string, Record<UserRole, StatusDisplay>> = {
    "pending-agreement": {
      host: {
        label: isFullyExecuted ? "Agreement Signed" : hasUserSigned ? "Awaiting Creator Signature" : "Sign Agreement",
        description: isFullyExecuted 
          ? "Both parties have signed. The collaboration is ready to begin."
          : hasUserSigned 
            ? "Waiting for the creator to sign the agreement."
            : "Please review and sign the collaboration agreement.",
        color: isFullyExecuted ? "bg-[#28D17C]" : hasUserSigned ? "bg-gray-100" : "bg-[#FFD84A]",
        textColor: "text-black",
        actionRequired: !hasUserSigned && !isFullyExecuted,
      },
      creator: {
        label: isFullyExecuted ? "Agreement Signed" : hasUserSigned ? "Awaiting Host Signature" : "Sign Agreement",
        description: isFullyExecuted 
          ? "Both parties have signed. The collaboration is ready to begin."
          : hasUserSigned 
            ? "Waiting for the host to sign the agreement."
            : "Please review and sign the collaboration agreement.",
        color: isFullyExecuted ? "bg-[#28D17C]" : hasUserSigned ? "bg-gray-100" : "bg-[#FFD84A]",
        textColor: "text-black",
        actionRequired: !hasUserSigned && !isFullyExecuted,
      },
    },
    active: {
      host: {
        label: "Active",
        description: "The collaboration is in progress. Waiting for content delivery.",
        color: "bg-[#4AA3FF]",
        textColor: "text-black",
        actionRequired: false,
      },
      creator: {
        label: "In Progress",
        description: "Create and submit your content when ready.",
        color: "bg-[#4AA3FF]",
        textColor: "text-black",
        actionRequired: true,
      },
    },
    "content-submitted": {
      host: {
        label: "Review Content",
        description: "The creator has submitted content for your review.",
        color: "bg-[#FFD84A]",
        textColor: "text-black",
        actionRequired: true,
      },
      creator: {
        label: "Under Review",
        description: "Your content is being reviewed by the host.",
        color: "bg-gray-100",
        textColor: "text-gray-700",
        actionRequired: false,
      },
    },
    approved: {
      host: {
        label: "Approved — Pay Creator",
        description: "Content approved! Complete payment to finalize.",
        color: "bg-[#FFD84A]",
        textColor: "text-black",
        actionRequired: true,
      },
      creator: {
        label: "Approved",
        description: "Your content was approved! Payment is being processed.",
        color: "bg-[#28D17C]",
        textColor: "text-black",
        actionRequired: false,
      },
    },
    completed: {
      host: {
        label: "Completed",
        description: "This collaboration has been successfully completed.",
        color: "bg-[#28D17C]",
        textColor: "text-black",
        actionRequired: false,
      },
      creator: {
        label: "Completed",
        description: "This collaboration has been successfully completed.",
        color: "bg-[#28D17C]",
        textColor: "text-black",
        actionRequired: false,
      },
    },
    cancelled: {
      host: {
        label: "Cancelled",
        description: "This collaboration was cancelled.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
      creator: {
        label: "Cancelled",
        description: "This collaboration was cancelled.",
        color: "bg-gray-200",
        textColor: "text-gray-600",
        actionRequired: false,
      },
    },
    "cancellation-requested": {
      host: {
        label: "Cancellation Requested",
        description: "A cancellation request is pending review.",
        color: "bg-[#FF6B6B]",
        textColor: "text-black",
        actionRequired: true,
      },
      creator: {
        label: "Cancellation Requested",
        description: "A cancellation request is pending review.",
        color: "bg-[#FF6B6B]",
        textColor: "text-black",
        actionRequired: true,
      },
    },
    "deadline-passed": {
      host: {
        label: "Deadline Passed",
        description: "The content deadline has passed. You can grant an extension or request cancellation.",
        color: "bg-[#FF6B6B]",
        textColor: "text-black",
        actionRequired: true,
      },
      creator: {
        label: "Deadline Passed",
        description: "The content deadline has passed. Submit content ASAP or message the host.",
        color: "bg-[#FF6B6B]",
        textColor: "text-black",
        actionRequired: true,
      },
    },
    disputed: {
      host: {
        label: "Under Review",
        description: "A dispute has been filed. Our team is reviewing the case.",
        color: "bg-red-100",
        textColor: "text-red-700",
        actionRequired: false,
      },
      creator: {
        label: "Under Review",
        description: "A dispute has been filed. Our team is reviewing the case.",
        color: "bg-red-100",
        textColor: "text-red-700",
        actionRequired: false,
      },
    },
  }

  const roleConfig = configs[status]?.[role]
  
  // Fallback for unknown status
  if (!roleConfig) {
    return {
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " "),
      description: "",
      color: "bg-gray-100",
      textColor: "text-gray-700",
      actionRequired: false,
    }
  }

  return roleConfig
}

// =============================================================================
// HELPER: Action Required Badge
// =============================================================================

export function ActionRequiredBadge({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[9px] font-bold text-white">
      Action Required
    </span>
  )
}
